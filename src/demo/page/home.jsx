var app = require('../app.js')
  , dom = app.dom
  , nowFeed = require('../component/now-feed.jsx')
  , vevoAPI = require('../../data-access-layer');

var homePage = app.react.createClass({
  displayName: 'Home Page',

  render: function () {
    return (
      <div className="page home-page container">
        <nowFeed data={this.props.nowFeed}/>
      </div>
    )
    ;
  }
});

/*
 * Register component and routes for the home page.
 */
app.registerRootComponent(homePage);
app.routes.addRoute('/', function(details, renderFn, isrc) {

  // get the now feed from the API and return the home page
  vevoAPI.getNowFeed(function(err, data) {
    renderFn(homePage({nowFeed:data}), {title:'VEVO'});
  });

});
