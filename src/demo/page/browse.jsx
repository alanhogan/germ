var app = require('../app.js')
  , dom = app.dom
  , vevoAPI = require('../../data-access-layer');

var browsePage = app.react.createClass({
  displayName: 'Browse Page',

  render: function () {
    return (
      <div className="page broswe-page container">
        <section>
          <h2><a href="/browse/premieres">Premieres</a></h2>
        </section>
        <section>
          <h2><a href="/browse/xx">Top Videos This Week</a></h2>
        </section>
        <section>
          <h2><a href="/browse/xx">Staff Picks</a></h2>
        </section>
        <section>
          <h2><a href="/browse/xx">Live Performances</a></h2>
        </section>
        <section>
          <h2><a href="/browse/xx">Popular Artists</a></h2>
        </section>
        <section>
          <h2><a href="/browse/xx">Emerging Artists, presented by McDonald&#8216;s</a></h2>
        </section>
        <section>
          <h2><a href="/browse/xx">Certified Artists</a></h2>
        </section>
      </div>
    )
    ;
  }
});

/*
 * Register component and routes for the browse page.
 */
app.registerRootComponent(browsePage);
app.routes.addRoute('/browse', function(details, renderFn, isrc) {
  renderFn(browsePage(), {title:'Browse VEVO'});
});
