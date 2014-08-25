// In the web.webpack config request is alias to browser-request
// a proxy version of request built to run in browsers using XHR
var request = require('superagent')
  , lru = require('lru-cache');

var endpoint = 'https://stg-apiv2.vevo.com';

/**
 * DAL is the data access layer.
 *
 * @constructor
 * @class DAL
 * @return foobar
 */
function DAL() {
  this.accessToken = this.tokenExpires = null;
  this.requestQue = [];
  this.cache = lru({
    max: 500,
    maxAge: 60000, // 1 min
    stale: false
  });
}

DAL.prototype.refreshAccessToken = function() {

  var self = this;
  request.post(endpoint + '/oauth/token')
    .set('Content-Type', 'application/json')
    .send(JSON.stringify({
      client_id: 'b950d913dc384d0583dfe73f65f34255',
      client_secret: 'a07a3f08e9fb4695b288ba707977ad21',
      grant_type: 'client_credentials',
      country: 'US',
      locale: 'en-us'
    }))
    .end(function(res) {
      if(res.error) {
        console.error('Cannot get access token because:', res.error, res.body);
      }

      body = res.body;

      self.accessToken = body.access_token;
      self.tokenExpires = body.expires_in;

      var cmd;
      while(cmd = self.requestQue.shift()) {
        cmd.fn.apply(self, cmd.args);
      }
    });
}

DAL.prototype.get = function(cacheKey, url, next) {
  if(!this.accessToken || this.tokenTimeout =='bad') {
    this.requestQue.push({fn:this.get, args:[cacheKey, url, next]});
    this.refreshAccessToken();
    return;
  }

  if(cacheKey) {
    var data = this.cache.get(cacheKey);
    if (data) {
      return next(null, data);
    }
  }

  url = endpoint + url;
  if(url.indexOf('?') == -1) {
    url += '?token=' + this.accessToken;
  } else {
    url += '&token=' + this.accessToken;
  }

  var self = this;

  request.get(url, function(res) {
    if(res.error) {
      return next(new Error('Cannot get because:'+res.error));
    }

    if(res.status != 200) {
      return next(new Error('Failed because:'+res.status));
    }

    body = res.body;

    if(cacheKey) {
      self.cache.set(cacheKey, body);
    }

    next(null, body);
  });
}

DAL.prototype.getNowFeed = function(next) {
  this.get('now-feed', '/now?page=1&size=40', next);
}

DAL.prototype.getPlaylist = function(id, next) {
  this.get('PL-' + id, '/playlist/' + id, function(err, playlistData) {
    if(err) {
      return next(err);
    }

    for(var j in playlistData.videos) {
      var i, details={}, data = playlistData.videos[j];

      // merge in stuff we need for our view
      for(i in data.artists) {
        item = data.artists[i];
        if(item.role == 'Main') {
          data.artist = item.name;
          data.artistUrl = '/artist/'+item.urlSafeName;
          data.artistImg = item.thumbnailUrl.replace(/^[^:]+:/,'');
          break;
        }
      }

      for(i in data.credits) {
        item = data.credits[i];

        if(!details[item.name]) details[item.name] = [item.value];
        else details[item.name].push(item.value);
      }

      for(i in details) {
        data[i] = details[i].join(',');
      }
    }

    next(null, playlistData);
  });
}

DAL.prototype.getArtist = function(id, next) {
  this.get('A-' + id, '/artist/' + id, next);
}

DAL.prototype.getArtists = function(next) {
  this.get('artists', '/artist', next);
}

DAL.prototype.getVideo = function(id, next) {
  this.get('V-' + id, '/video/' + id, function(err, data) {
    var i, details={};

    if(err) {
      return next(err);
    }

    // merge in stuff we need for our view
    for(i in data.artists) {
      item = data.artists[i];
      if(item.role == 'Main') {
        data.artist = item.name;
        data.artistUrl = '/artist/'+item.urlSafeName;
        data.artistImg = item.thumbnailUrl.replace(/^[^:]+:/,'');
        break;
      }
    }

    for(i in data.credits) {
      item = data.credits[i];

      if(!details[item.name]) details[item.name] = [item.value];
      else details[item.name].push(item.value);
    }

    for(i in details) {
      data[i] = details[i].join(',');
    }

    next(null, data);
  });
}

DAL.prototype.searchVideo = function(options, next) {
  if(!options) options = {};
  if(!options.page) options.page = 1;
  if(!options.size) options.size = 6;

  var url = '/videos?page='+options.page+'&size='+options.size;
  var id = options.page.toString() + options.size;

  if(options.sort) {
    id += options.sort;
    url += '&sort=' + options.sort;
  }

  // todo: need to make static mappings and check undefined

  if(options.ispremiere) {
    id += options.ispremiere;
    url += '&ispremiere=' + options.ispremiere?'true':'false';
  }

  if(options.live) {
    id += options.live;
    url += '&islive=' + (options.live ? 'true':'false');
  }

  this.get('VS-'+id, url, next);
}

module.exports = new DAL();
