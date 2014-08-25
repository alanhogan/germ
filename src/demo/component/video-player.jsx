var react = require('react')
  , playlist = require('./playlist.jsx')
  , dom = react.DOM;

var videoPlayer = react.createClass({

  displayName: 'videoPlayer',
  getInitialState: function() {
    return {
      drawerOpen: false
    }
  },

  toggleDrawClick: function(event) {
    this.setState({
      drawerOpen: !this.state.drawerOpen
    });
  },

  render: function() {
    var stateStyle;
    if(this.state.drawerOpen) {stateStyle = 'player drawer-open';}
    else {stateStyle = 'player';}

    return (
      <section className="video-component">
        <div className="hero-image" style={{'background-image':'url(https://sassets.vevo.com/adsales/v3/McDonalds/2014Q3_LIFT_McCafeMcMuffin/2014.0805_MCD_LIFT_CONT1_CONTENT_RB_1500x620.jpg)'}}>
          <div className={stateStyle}>
            <div className="wrapper">
              <div className="side-bar-button" onClick={this.toggleDrawClick}>
                <a>{this.state.drawerOpen?'HIDE PLAYLIST':'SHOW PLAYLIST'}</a>
              </div>
              <div className="side-bar">
                {playlist({playlist:this.props.playlist})}
              </div>
              <iframe id="ytplayer" className="youtube-player" type="text/html"
                src={'http://www.youtube.com/embed/'+this.props.video.youTubeId+'?autoplay=1&origin=http://example.com'}
                frameBorder="0">
              </iframe>
            </div>
          </div>
        </div>
      </section>

      );
  }

});

module.exports = videoPlayer;