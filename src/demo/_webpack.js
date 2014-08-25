var fs = require('fs')
  , path = require('path')
  , webpack = require('webpack');

/*
 * Common webpack config for both nodejs and browser version.
 */
var config = {
  cache:true,
  devtool: '#inline-source-map',
  entry: {
    'demo': path.join(__dirname, 'demo.js'),
    'demo-assets': path.join(__dirname, 'demo-assets.js')
  },
  plugins: [
  ],
  externals: {
  },
  output: {
    path: path.join(__dirname, '..', '..', 'public', 'js'),
    filename: '[name].js'
  },
  module: {
    noParse: /\.min\.js/,
    unknownContextCritical: false,
    loaders: [
      //{ test: /\.jsx/, loader: 'sweetjs?readableNames=true,modules[]='+path.join(__dirname, '..', '..', 'macros', 'jadex.sjs') },
      { test: /\.json/, loader: 'json' },
      { test: /\.jsx/, loader: 'jsx-loader?insertPragma=dom' },
      { test: /\.css$/, loader: 'style!css!autoprefixer' },
      { test: /\.less$/, loader: 'style!css!autoprefixer!less' },
      { test: /\.styl$/, loader: 'style!css!autoprefixer!stylus' },
      { test: /\.woff$/, loader: "url-loader?limit=10000&minetype=application/font-woff" },
      { test: /\.ttf$/, loader: "file-loader" },
      { test: /\.eot$/, loader: "file-loader" },
      { test: /\.otf$/, loader: "file-loader" },
      { test: /\.svg$/, loader: "file-loader" },
      //{ test: /\.coffee$/, loader: "coffee-loader" }
    ]
  }
};

var nodejsConfig = Object.create(config);
var browserConfig = Object.create(config);

/*
 * Overwrite webpack config for the NodeJS server. Allowing
 * server side rendering. Puts the NodeJS version in ./_webpack/* and filters out
 * none UI components list assets (i.e. css, fonts, etc.)
 */
nodejsConfig.externals.react = 'react';
nodejsConfig.output = {
  path: path.join(__dirname, '_webpack'),
  filename: '[name].js',
  libraryTarget:'commonjs2'
};
nodejsConfig.target = 'node';
nodejsConfig.node = {
  __dirname: true,
  __filename: true
}

/*
 * Overwrite webpack config for the Browser server. Allowing for a precomputed
 * react version to help speed up the webpack build time.
 */
browserConfig.externals.react = 'React';

/*
 * Include environmental constants to let code change logic and
 * for the nodejs version include a
 */
browserConfig.plugins = browserConfig.plugins.concat([new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  'SERVER_ENV': JSON.stringify(false),
  'CLIENT_ENV': JSON.stringify(true)
  }),
  new webpack.BannerPlugin(
  'GERM v'+JSON.parse(fs.readFileSync('./package.json')).version+'\n'+
  'https://github.com/Rebelizer/germ\n\n'+
  'Copyright 2014 Demetrius Johnson\n'+
  'Released under the MIT license\n'+
  'http://www.apache.org/licenses/\n\n'+
  'Date: '+new Date().toJSON())
]);

nodejsConfig.plugins = nodejsConfig.plugins.concat([
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'global.GENTLY': false,
    'SERVER_ENV': JSON.stringify(true),
    'CLIENT_ENV': JSON.stringify(false)
  }),
  new webpack.BannerPlugin('require("source-map-support").install({handleUncaughtExceptions: false});',{
    raw:true
  })
]);

module.exports = {
  global: true,
  browser: browserConfig,
  nodejs: nodejsConfig
};