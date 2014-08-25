var react = require('react')
  , reactIntlMixin = require('react-intl')
  , dom = react.DOM;

var footer = react.createClass({
  displayName: 'App Footer',
  mixins: [reactIntlMixin],

  render: function () {
    return (
      <footer id="nav">
        <div className="container">
          <section className="sitemap">
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Apps</a></li>
              <li><a href="#">VEVO TV</a></li>
              <li><a href="#">News</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Help Center</a></li>
            </ul>
          </section>
          <section className="socnet">
            <ul>
              <li><a href="#">Twitter</a></li>
              <li><a href="#">YouTube</a></li>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">Pinterest</a></li>
              <li><a href="#">Tumblr</a></li>
            </ul>
          </section>
          <section className="legal">
            <ul>
              <li><a href="#">Terms &amp; Conditions</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">EULA</a></li>
            </ul>
          </section>
          <section>
            <ul>
              <li><a href="#">English (US)</a></li>
              <li><a href="#">Deutsch</a></li>
              <li><a href="#">English (UK)</a></li>
              <li><a href="#">English (AU)</a></li>
              <li><a href="#">Español (ES)</a></li>
              <li><a href="#">Français</a></li>
              <li><a href="#">Italiano</a></li>
              <li><a href="#">Nederlands</a></li>
              <li><a href="#">Polski</a></li>
            </ul>
          </section>
          <div className="copyright">
            &copy; 2017 <span translate>VEVO LLC, All Rights Reserved</span>
          </div>
        </div>
      </footer>
      );
  }
});

module.exports = footer;