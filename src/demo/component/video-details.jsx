var react = require('react')
  , reactIntlMixin = require('react-intl')
  , dom = react.DOM;

var videoDetails = react.createClass({

  displayName: 'videoDetails',
  mixins: [reactIntlMixin],

  getInitialState: function() {
    return {
      showCredits: false
    }
  },

  // http://img.cache.vevo.com/Content/VevoImages/artist/3231858819325FD8D84FEE279C8DA83020144818251216.jpg?width=-2&height=700&crop=auto

  toggleCredits: function() {
    console.log('toggle', this.state.showCredits);
    this.setState({
      showCredits: !this.state.showCredits
    });
  },

  render: function () {
    return (
      <section className="video-detail-component">
        <div className="container">
          <div className="details">
            <div className="artist">
              <div className="view-count">
                {this.formatNumber(this.props.video.views.total)} <span>views</span>
              </div>
              <img src={this.props.video.artistImg} />
              <h1>{this.props.video.title}</h1>
              <h2><a href={this.props.video.artistUrl}>{this.props.video.artist}</a></h2>
              <p>Directed by Francesco Carrozzini
                <a style={{display:(this.state.showCredits?'none':'display')}} onClick={this.toggleCredits}>More info...</a>
                <a style={{display:(this.state.showCredits?'display':'none')}} onClick={this.toggleCredits}>Hide info</a>
              </p>
            </div>
            <div>
              <ul>
                <li><a className="action share share-icon-vevo" /></li>
                <li><a className="action add add-icon-vevo" /></li>
                <li><a className="info-icon-vevo action info" /></li>
              </ul>
              <div className="buy">
                <p>Buy on<br /><a>Amazon</a> | <a>iTunes</a></p>
              </div>
            </div>
          </div>
          <div className="ad">
            <img src="https://sassets.vevo.com/adsales/v3/McDonalds/2014Q3_LIFT_McCafeMcMuffin/2014.0805_MCD_LIFT_CONT1_CONTENT_RB_300x60.jpg" />
          </div>
        </div>
      </section>
      );
  }

});

module.exports = videoDetails;