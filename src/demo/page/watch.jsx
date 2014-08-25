var app = require('../app.js')
  , dom = app.dom
  , vevoAPI = require('../../data-access-layer.js');

var videoDetails = require('../component/video-details.jsx')
  , videoPlayer = require('../component/video-player.jsx')
  , nowFeed = require('../component/now-feed.jsx')

var watchPage = app.react.createClass({
  displayName: 'Watch Page',

  render: function () {
    if(this.props.loading) {
      return (
        <div className="page watch-page">
          <h1>Loading...</h1>
        </div>
        );

    } else {
      return (
        <div className="page watch-page">
          <videoPlayer video={this.props.video} playlist={this.props.playlist} />
          <videoDetails video={this.props.video} />
          <div className="container now-feed-container">
            <nowFeed data={this.props.nowFeed} page={1}/>
          </div>
        </div>
        );
    }
  }
});

/*
 * Register component and routes for the watch page.
 */
app.registerRootComponent(watchPage);
app.routes.addRoute('/watch/{isrc}', function(details, renderFn, isrc) {
  console.log('/watch/{isrc}', isrc);

  // display the loading status now
  app.renderComponent(watchPage({loading:true}));

  var playlistData, videoData, feedData, count = 3;
  function done(err) {
    if(err) {
      renderFn(watchPage({video:null}), {title:'VEVO'});
      count=-1;
    }

    if(--count === 0) {
      renderFn(watchPage({video: videoData, nowFeed: feedData, playlist: playlistData}), {title: videoData.title});
    }
  }

  // now load the playlist because we will need it for initial render
  vevoAPI.getPlaylist('f2e58a00-780d-4904-a1cc-0305f29425bf', function(err, data) {
    if(err) {
      console.error('Error loading playlist', id,'because', err.message || err);
      return done(err);
    }

    playlistData = {id: data.playlistId, videos: data.videos};
    done(null);
  });

  // get the video details from the API and return the watch page
  vevoAPI.getVideo(isrc, function(err, data) {
    videoData = data;
    done();
  });

  vevoAPI.getNowFeed(function(err, data) {
    feedData = data;
    done();
  });
});
