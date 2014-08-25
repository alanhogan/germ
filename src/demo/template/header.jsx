var react = require('react')
  , internalMixin = require('../mixin/internalClick.js')
  , dom = react.DOM;

var header = react.createClass({
  displayName: 'App Header',
  mixins: [internalMixin],

  render: function () {
    return (
      <header id="nav">
        <div className="container">
          <div className="logo" href="/" onClick={this.internalClick}></div>
          <ul>
            <li><a href="/tv" onClick={this.internalClick}>vevo tv</a></li>
            <li><a href="/search" onClick={this.internalClick}>search</a></li>
            <li><a href="/browse" onClick={this.internalClick}>browse</a></li>
            <li><a href="/browse/shows" onClick={this.internalClick}>shows</a></li>
          </ul>
        </div>
      </header>
      );
  }
});

module.exports = header;