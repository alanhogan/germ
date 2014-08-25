module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],
    client: {
      mocha: {
        ui: 'tdd'
      }
    }
  });
};

