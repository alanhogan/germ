var app = require('../app.js')
  , dom = app.dom;

var page404 = app.react.createClass({
  displayName: '404 Page',

  render: function () {
    return (
      <div className="page not-found-page">
        <h1>Can not find page</h1>
      </div>
    )
    ;
  }
});

/*
 * Register component and routes for the 404 page.
 */
app.registerRootComponent(page404);
app.routes.bypassed.add(function(details, renderFn) {
  renderFn(page404(), {status:404});
});
