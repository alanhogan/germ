var app = require('../app.js')
  , dom = app.dom
  , vevoAPI = require('../../data-access-layer');

var showsPage = app.react.createClass({
  displayName: 'Shows Page',

  render: function () {
    return (
      <div className="page shows-page container">
      </div>
    )
    ;
  }
});

/*
 * Register component and routes for the shows page.
 */
app.registerRootComponent(showsPage);
app.routes.addRoute('/browse/shows', function(details, renderFn, isrc) {
  renderFn(showsPage(), {title:'Browse Shows'});
});
