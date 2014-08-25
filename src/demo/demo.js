/*
 * Webpack entry point.
 *
 * Include all the components needed by he demo app.
 */

// bootstrap the app and also workaround webpack requirement that
// you can not inlcude entry points. 'app.js' is a singleton so
// you can inlcude in any modules to get access to events.
module.exports = require('./app.js');

// add component we want to init here or add in _webpack.js
require('./page/404.jsx');
require('./page/watch.jsx');
require('./page/browse.jsx');
require('./page/home.jsx');
require('./page/tv.jsx');
require('./page/shows.jsx');

require('../playlist-store.js');
