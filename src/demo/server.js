var express = require('express')
  , path = require('path')
  , favicon = require('serve-favicon')
  , morgan  = require('morgan')
  , app = require('./_webpack/demo')

module.exports = function(next) {
  var server = express();

  // setup express static assets inlcuding the facicon.ico
  server.use(favicon(path.join(__dirname, '..', '..', 'public', 'favicon.ico')));
  server.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
  server.use(express.static(path.join(__dirname, '..', '..', 'public')));

  // add the apps middleware
  server.use(app.middleware.bind(app));

  next(null, server);
}
