#!/usr/bin/env node

"use strict";

var program = require('commander')
  , os = require('os')
  , util = require('util')
  , path = require('path')
  , fs = require('fs')
  , spdy = require('spdy')
  , winston = require('winston')
  , winstonMail = require('winston-mail')
  , nconf = require('nconf')
  , cluster = require('cluster-master')
  , version = require('../package.json').version;

// list of fields we do not want to
// console log in verbose mode for security
// i.e. username and passwords to database, etc.
var security = /\s(user|pass|aws_)\w*\s+.+$/igm;
var envWhiteList = ['BOOT_PATH', 'NODE_ENV'];
var bootPATH = process.cwd();

// list of server errors to ignore and not email
var ignoreServerErrList = [404];

program
  .version(require('../package.json').version)
  .usage('[options] app')
  .option('-v, --verbose [silly|debug|verbose|info|warn|error]', 'verbose mode', 'info')
  .option('-c, --config <env name>', 'base config file', process.env.NODE_ENV)
  .option('-b, --boot <app>', 'app to bootstrap', process.env.BOOT_PATH || path.join(__dirname, '..', 'src', 'demo', 'server.js'))
  .option('--http:port <port>', 'http server port', process.env.PORT || 3000)
  .option('--http:address <ip>', 'http bind address', process.env.BIND_ADDR || '0.0.0.0')
  .option('--https:port <port>', 'http server port', false)
  .option('--https:address <ip>', 'http bind address', process.env.BIND_ADDR || '0.0.0.0')
  .option('--spdy', 'spdy port', false)
  .option('-C, --cluster:count <size>', 'number of process', 0)

program.parse(process.argv);

process.chdir(path.join(__dirname, '..'));

// now build up the configuration starting with env, default.json, env config, the arguments
// for nested config use HTTP__PORT=80 germ -v
nconf.env('__');
nconf.env({whitelist:envWhiteList});
nconf.add('default', { type:'file', file: path.join(__dirname, 'config', 'default.json')});

// overwrite default configuration with specified configuration file
if(program.config) {
  program.config = /\.json$/i.test(program.config) ? program.config : program.config + '.json';
  program.config = path.join(__dirname, 'config', program.config)
  if(!fs.existsSync(program.config)) {
    console.error('Cannot find env config file "'+program.config+'".');
    process.exit(1);
  }

  nconf.add('env', { type:'file', file: program.config});
}

// overwrite configuration with argument passed in
for(var i in program.options) {
  var opt = program.options[i].long;
  if(!opt || ['--version'].indexOf(opt) != -1) {
    continue;
  }

  opt = opt.substring(2);
  var val = program[opt];

  if(opt && val) {
    nconf.set(opt, val);
  }
}

if(!process.env.CLUSTER_SLAVE) {
  console.log('\x1B[32m');
  console.log('                                      ___');
  console.log('   ____ ____  _________ ___     _   _<  /');
  console.log('  / __ `/ _ \\/ ___/ __ `__ \\   | | / / / ');
  console.log(' / /_/ /  __/ /  / / / / / /   | |/ / /  ');
  console.log(' \\__, /\\___/_/  /_/ /_/ /_/    |___/_/   ');
  console.log('/____/');
  console.log('\x1B[0m');
}

nconf.set('winston:containers:console:console:level', nconf.get('verbose'));

// setup the apps default logger and overwrite the javascript console to use our logger
var germLogger = winston.loggers.add('germ', nconf.get('winston:containers:console'));
germLogger.extend(console);
console.log = germLogger.info;

console.log('Version:', version);
console.info('Launch:', bootPATH = path.resolve(bootPATH, nconf.get('boot')));
console.verbose('System:', process.platform, 'pid:', process.pid, 'uid:', process.getuid(), 'gid:', process.getgid(), JSON.stringify(process.versions,null, 2).replace(/\s+[{},\]]+/g,'').replace(/[{\[":,]/g,''));
console.verbose('Configuration '+(program.config||'')+':', JSON.stringify(nconf.get(), null, 2)
  .replace(/\s+[{},\]]+/g,'')
  .replace(/[{\[":,]/g,'')
  .replace(security, '$1 ################'));

// catch all uncaught exception and try to email them
if(nconf.get('winston:containers:alert')) {
  var alertLogger = winston.loggers.add('alert', nconf.get('winston:containers:alert'));

  var logError = function(err, details) {
    var body = 'Stack Trace:\n\n' + err.stack + '\n\n';

    if(details) {
      body += 'Details:' + details;
    }

    // only include the system information if requested
    // in development mode this is a lot of information to parse
    if (nconf.get('stackTrace:includeSystemInfo')) {
      try {
        body += 'VERSION: ' + version + '\n';
        body += 'CWD: ' + process.cwd() + '\n';
        body += 'SYSTEM: ' + process.platform + ' pid: ' + process.pid + ' uid: ' + process.getuid() + ' gid: ' + process.getgid() + '\n';
        body += JSON.stringify(process.versions, null, 1)
          .replace(/\s+[{},\]]/g, '')
          .replace(/[{\[":,]/g, '') + '\n\n';

        body += 'CONFIGURATION ' + (program.config || '') + ':\n';
        body += JSON.stringify(nconf.get(), null, 1)
          .replace(/\s+[{},\]]/g, '')
          .replace(/[{\[":,]/g, '')
          .replace(security, '$1 ################') + '\n\n';

        body += 'NETWORK:\n' + util.inspect(os.networkInterfaces(), {showHidden: true, depth: 5}) + '\n';
        body += 'LOAD AVE: ' + util.inspect(os.loadavg(), {showHidden: true, depth: 5}) + '\n';
        body += 'UPTIME: ' + os.uptime() + '\n';
        body += 'TOTALMEM: ' + os.totalmem() + '\n';
        body += 'FREEMEM: ' + os.freemem() + '\n';
        body += 'CPUS:\n\n' + util.inspect(os.cpus(), {showHidden: true, depth: 5}) + '\n';
      } catch (ex) {
        body += 'FORMAT ERROR:\n\n' + ex.message + '\n\n' + err.stack + '\n\n';
      }
    }

    alertLogger.error(body);
  }

  process.on("uncaughtException", logError);
}

// after we have make sure we have all the configuration and error handling
// start the cluster.
if(program['cluster:count'] > 0 && !process.env.CLUSTER_SLAVE) {
  process.env.CLUSTER_SLAVE = true;
  cluster({
    exec: path.join(__dirname, 'germ.js'),
    size: parseInt(program.cluster, 10),
    env: process.env,
    args: process.argv,
    silent: false,
    signals: true,
    repl: nconf.get('cluster:repl')&&{port:parseInt(nconf.get('cluster:repl:port')), address:nconf.get('cluster:repl:address')},
    onMessage: function (message) {
      console.error("SLAVE %s %j", this.uniqueID, message);
    }
  });

  return;
}

require(bootPATH)(function(err, app) {
  if(err) {
    alertLogger.error('Cannot load frontend App', bootPATH, 'because:', err.message || err);
    process.exit(1);
  }

  if(nconf.get('winston:containers:alert')) {
    app.on('error', function(err, ctx) {
      var details = false;

      // ignore 404 errors
      if(ignoreServerErrList.indexOf(err.status) != -1) {
        return;
      }

      try {
        if(ctx) {
          details = JSON.stringify(ctx, null, 2);
        } else {
          details = false;
        }
      } catch(ex) {
        details = ex.message || 'Error in ctx';
      }

      logError(err, details);
    });
  }

  if(nconf.get('spdy') || nconf.get('https:port')) {
    var opt = {
      key: fs.readFileSync(path.join(__dirname, 'keys', 'key.pem')),
      cert: fs.readFileSync(path.join(__dirname, 'keys', 'cert.pem')),
      ca: fs.readFileSync(path.join(__dirname, 'keys', 'ca.pem')),
      windowSize: 1024 * 1024,
      autoSpdy31: false
    };

    spdy.createServer(opt, app.callback()).listen(nconf.get('https:port')||443, nconf.get('https:address'), function () {
      console.log('Listen on', nconf.get('https:port')||443, nconf.get('https:address'));
    });
  } else if(nconf.get('https:port')) {
    // TODO: raw ssl server with out spdy
  }

  app.listen(nconf.get('http:port'), nconf.get('http:address'), nconf.get('http:max_syn_backlog'), function () {
    console.log('Listen on', nconf.get('http:port'), nconf.get('http:address'));
  });
});
