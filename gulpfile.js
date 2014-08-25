'use strict';

var gulp = require('gulp')
  , fs = require('fs')
  , path = require('path')
  , plugins = require('gulp-load-plugins')()
  , gutil = require('gulp-util')
  , through = require('through2')
  , git = require("git-promise")
  , conventionalChangelog = require('conventional-changelog')
  , spawn = require('child_process').spawn
  , browserSync = require('browser-sync')
  , reload = browserSync.reload
  , webpack = require("webpack");

plugins.help(gulp);

// ###############################################
// BUILD UI CODE
// ###############################################

function setupWebpacker(devMode, includeAnalyse, webpackConfigFile) {

  var baseWebpackConfig = require(webpackConfigFile);
  var baseDir = path.dirname(webpackConfigFile);
  var config = Object.create(baseWebpackConfig);

  if(devMode) {
    // Include the source map and turn on debuging
    config.nodejs.debug = true;
    config.browser.debug = true;
  } else {
    config.browser.devtool = 'source-map';
    config.browser.plugins = config.browser.plugins.concat([
      new webpack.optimize.UglifyJsPlugin({compressor:{warnings: false}}),
      new webpack.optimize.DedupePlugin()
    ]);
  }

  if(includeAnalyse) {
    // http://webpack.github.io/analyse/
    config.nodejs.profile = 'json';
    config.nodejs.recordsPath = path.join(baseDir, '_webpack', 'stats', 'node.json');
    config.browser.profile = 'json';
    config.browser.recordsPath = path.join(baseDir, '_webpack', 'stats', 'ui.json');
  }

  var browserCompiler = webpack(config.browser);
  var nodejsCompiler = webpack(config.nodejs);

  return function(next) {
    var c = 2;
    function done() {
      if(--c == 0) {
        gutil.log('[build dev]', 'done building');
        reload();

        next();
      }
    }

    browserCompiler.run(function(err, stats) {
   		if(err) throw new gutil.PluginError('webpack:build-dev:browser', err);
      gutil.log('[build dev(browser)]', stats.toString({
        colors: true,
        chunks: false
      }));

   		done();
   	});

    nodejsCompiler.run(function(err, stats) {
   		if(err) throw new gutil.PluginError('webpack:build-dev:nodejs', err);
      gutil.log('[build dev(server)]', stats.toString({
        colors: true,
        chunks: false
      }));

   		done();
   	});
  }
}

gulp.task('build:dev', 'Build development webpack (sourcemap, non minfiyed)', setupWebpacker(true, true, path.join(__dirname, 'src', 'demo', '_webpack.js')));
gulp.task('build', 'Build production webpack (minfiyed)', setupWebpacker(false, false, path.join(__dirname, 'src', 'demo', '_webpack.js')));
gulp.task('watch', 'Webpack watch', ['build:dev'], function() {
	gulp.watch(['./assets/**/*', './src/**/*', '!./src/**/_webpack/**/*'], ['build:dev']);
});

// ###############################################
// BUILD DOCS
// ###############################################

gulp.task('build:docs', function(next) {
  fs.readFile('./package.json', 'utf8', function(err, data) {
    var pkg = JSON.parse(data);

    gulp.src(['./src/**/*.js', './src/**/*.jsx', '!./src/**/_webpack', './README.md'])
      .pipe(plugins.jsdoc('./docs', {
        path: 'node_modules/jaguarjs-jsdoc',
        tutorials: path.join(__dirname, 'tutorials'),
        cleverLinks: true,
        monospaceLinks: true,

        applicationName: 'Germ v' + pkg.version,
        disqus: '',
        googleAnalytics: '',
        openGraph: {
          title: '',
          type: "website",
          image: '',
          site_name: '',
          url: ''
        },
        meta: {
          title: 'Germ v' + pkg.version,
          description: '',
          keyword: ''
        },
        linenums: true
      }))
  });
});

// ###############################################
// CLEAN
// ###############################################

gulp.task('clean', 'Clean all the webpack, docs, public', function(next) {
  gulp.src(['./src/**/_webpack/**/*', './docs/**/*',
    './public/js/demo.js', './public/js/demo.js.map',
    './public/js/demo-assets.js', './public/js/demo-assets.js.map'
  ], {read: false})
    //.pipe(require('gulp-print')())
    .pipe(plugins.clean())
});

// ###############################################
// UNIT TESTS
// ###############################################

// we have mocha & karma to run test in the broswer also

// ###############################################
// SERVER -- DEVELOPMENT
// ###############################################

gulp.task('devup', 'Start with broswer sync', ['run'], function (next) {
  browserSync.init(null, {
    proxy: "http://127.0.0.1:3000",
    port: 8080,
    notify: false
  });
})

var node;
gulp.task('run', 'Start germ and reload on file changes', ['watch'], function(next) {
  if (node) node.kill();

  node = spawn(path.join(__dirname, 'bin', 'germ'), ['-c', 'local'], {cwd:__dirname, stdio:'inherit'});
  node.on('close', function (code) {
    if (code === 8) {
      gutil.log('Error detected, waiting for changes...', code);
    }
  });
  node.on('error', function (code) {
    gutil.log('Error detected:', arguments);
  });

  next();
});

// clean up if an error goes unhandled.
process.on('exit', function() {
    if (node) node.kill()
});

// ###############################################
// UNIT & END-TO-END TESTS
// ###############################################

gulp.task('test', 'Run unit tests and exit on failure', function () {
  return gulp.src(['tests/**/*.spec.js', '!tests/karma/**'])
    .pipe(plugins.mocha({
      reporter: 'Spec' // dot
    }))
    .on('error', function (err) {
      //process.emit('exit');
    });
});

gulp.task('karma', 'in broswer love', function() {
  return gulp.src('tests/karma/**/*.spec.js')
    .pipe(plugins.karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }))
    .on('error', function (err) {
      throw err;
    });
});

// ###############################################
// DEPLOYMENT SCRIPTS
// ###############################################

gulp.task('build:release', function(next) {
  gulp.src(['./package.json'])
    .pipe(plugins.bump({type: 'minor'}))
    .pipe(gulp.dest('./'))
    .on('error', next)
    .on('end', function() {
      fs.readFile('./package.json', 'utf8', function(err, data) {
        var pkg = JSON.parse(data);
        conventionalChangelog({
          repository: pkg.repository.url,
          version: pkg.version
        }, function(err, log){
          if(err) return next(err);
          fs.writeFile('CHANGELOG.md', log, {flag:'w', encoding:'utf8'}, function(err) {
            if(err) return next(err);

            git('add package.json CHANGELOG.md').then(function() {
              git('commit -m "chore(release): v'+pkg.version+'"').then(function() {
                git('tag -a "v'+pkg.version+'" -m "Tagged '+new Date().toString()+'"').then(function() {
                  next(null);
                }).fail(function (err) {next(err);});
              }).fail(function (err) {next(err);});
            }).fail(function (err) {next(err);});
          });
        });
      });
    })
});
