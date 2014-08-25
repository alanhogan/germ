var vevoAPI = require('./data-access-layer.js')
  , app = require('./demo/app.js')

function store() {
  this.videos = [];

  // this is a hack! this is not safe because its async but for testing/demo this is easy!
  this.loadPlaylist('f2e58a00-780d-4904-a1cc-0305f29425bf', function() {});

  var id = this.id;
  this.listenTo = app.eventChannel
    .filter(function(val) {return val.add && val.playlistId == id;})
    .onValue(this.add.bind(this));
}

store.prototype.loadPlaylist = function(id, next) {
  var self = this;
  this.id = id;

  vevoAPI.getPlaylist(id, function(err, data) {
    if(err) {
      console.error('Error loading playlist', id,'because', err.message || err);
      return next(err);
    }

    self.videos = data.videos;
    next(null, self)
  });
}

store.prototype.add = function(val) {
  var self = this;
  vevoAPI.getVideo(val.add.isrc, function(err, data) {
    console.log(data);
    self.videos.push(data);
    app.eventChannel.push({videos:self.videos, playlistId:self.id});
  })
}

module.exports = new store();