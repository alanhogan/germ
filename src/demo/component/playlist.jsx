var react = require('react')
  , reactIntlMixin = require('react-intl')
  , internalMixin = require('../mixin/internalClick.js')
  , app = require('../app.js')
  , dom = react.DOM;

var playlistItem = react.createClass({
  displayName: 'Playlist Item',
  mixins: [internalMixin, reactIntlMixin],

  render: function() {
    return (
      <li>
        <a href={'/watch/'+this.props.video.isrc} onClick={this.internalRouteOnClick('/watch/'+this.props.video.isrc)} className="videoLink">
          <span className="image">
            <img src={this.props.video.artistImg}/>
            <span className="video-time">{this.props.video.duration}s<br/></span>
            <span className="video-count">{this.formatNumber((this.props.video.views && this.props.video.views.total) || 0)} views<br/></span>
          </span>
          <span className="title">{this.props.video.title}</span>
          <span className="by">
            by <b><span className="">{this.props.video.artist}</span></b>
          </span>
        </a>
      </li>
      );
  }
})

var playlist = react.createClass({
  displayName: 'Playlist',

  getInitialState: function() {
    return {
      videos: this.props.playlist.videos
    }
  },

  componentDidMount: function() {
    console.log('@@componentDidMount', this.props);
    var id = this.props.playlist.id;
    this.listenTo = app.eventChannel.filter(function(val) {return val.videos && val.playlistId == id;}).onValue(this.onPlaylistUpdate.bind(this));
  },

  componentWillUnmount: function() {
    console.log('@@componentWillUnmount', this.stream);
    this.listenTo(); // remove the listener
  },

  onPlaylistUpdate: function(value) {
    console.log('onPlaylistUpdate', value);
    this.setState({videos: value.videos});
  },

  render: function () {
    return (
      <div className="playlist-component">
        <ul>
          {this.state.videos.map(function(video,ix) {return (<playlistItem key={ix} video={video}/>);})}
        </ul>
      </div>
      );
  }
});

module.exports = playlist;

