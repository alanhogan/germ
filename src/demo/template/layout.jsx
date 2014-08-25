var react = require('react')
  , dom = react.DOM
  , reactIntlMixin = require('react-intl')
  , header = require('./header.jsx')
  , footer = require('./footer.jsx')

var layout = react.createClass({
  displayName: 'App Layout',

  mixins: [reactIntlMixin],

  getInitialState: function() {
    return {
      body: this.props.body
    };
  },

  render: function() {
    return (
      <div>
        {header()}
        {this.state.body}
        {footer()}
      </div>
    );
  }
});

//
module.exports = layout;
