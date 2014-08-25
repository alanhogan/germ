module.exports = {
  internalClick: function(event) {
    console.log('internalClick', event.target, event.target.getAttribute('href'))
    History.pushState(null, null, event.target.getAttribute('href'));
    event.preventDefault();
    return false;
  },

  internalRouteOnClick: function(path) {
    return function(event) {
      console.log('internalRoute', path)
      History.pushState(null, null, path);
      event.preventDefault();
      return false;
    }
  }
}