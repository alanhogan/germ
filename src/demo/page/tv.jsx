var app = require('../app.js')
  , dom = app.dom;

var tvPage = app.react.createClass({
  displayName: 'TV Page',

  render: function () {
    return (
      <div className="page tv-page">
        <h1>TV page</h1>
      </div>
    )
    ;
  }
});

/*
 * Register component and routes for the TV page.
 */
app.registerRootComponent(tvPage);
app.routes.addRoute('/tv', function(details, renderFn, isrc) {
  renderFn(tvPage(), {title:'VEVO TV'});
});
