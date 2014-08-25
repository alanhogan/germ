var react = require('react')
  , reactIntlMixin = require('react-intl')
  , internalMixin = require('../mixin/internalClick.js')
  , app = require('../app.js')
  , dom = react.DOM;

// TODO: Think about adding the now-feed.styl in this dir and include here and not in the assets.js that way its all together

var videoItem = react.createClass({
  displayName: 'Video Post',
  mixins: [internalMixin],

  addToPlayList: function(){
    app.eventChannel.push({add:this.props.post, playlistId:'f2e58a00-780d-4904-a1cc-0305f29425bf'});
  },

  render: function() {
    return (
      <section key={this.props.ix} className="post video-post" style={this.props.style}>
        <div className="title">
          <h4>FEATURED VIDEO <span>12W</span></h4>
          <ul>
            <li><a className="action share share-icon-vevo" /></li>
            <li><a className="action add add-icon-vevo" onClick={this.addToPlayList}/></li>
          </ul>
        </div>
        <img src={this.props.post.image} />
        <h2><a href={'/watch/'+this.props.post.isrc} onClick={this.internalClick}>{this.props.post.name}</a></h2>
        <p>{this.props.post.description}</p>
      </section>
      );
  }
});

var linkItem = react.createClass({
  displayName: 'Link Post',

  render: function () {
    return (
      <section key={this.props.ix} className="post video-post" style={this.props.style}>
        <div className="title">
          <h4>FEATURED VIDEO <span>12W</span></h4>
          <ul>
            <li><a className="action share share-icon-vevo" /></li>
            <li><a className="action add add-icon-vevo" /></li>
          </ul>
        </div>
        <img src={this.props.post.image} />
        <h2><a href={this.props.post.url} onClick={this.internalClick}>{this.props.post.name}</a></h2>
        <p>{this.props.post.description}</p>
      </section>
      );
  }
});

var artistsItem = react.createClass({
  displayName: 'Artists Post',

  render: function () {
    return (
      <section key={this.props.ix} className="post video-post" style={this.props.style}>
        <div className="title">
          <h4>FEATURED VIDEO <span>12W</span></h4>
          <ul>
            <li><a className="action share share-icon-vevo" /></li>
            <li><a className="action add add-icon-vevo" /></li>
          </ul>
        </div>
        <img src={this.props.post.artists[0].image} />
        <h2><a href={'/artists/'+this.props.post.artists[0].urlSafeName} onClick={this.internalClick}>{this.props.post.name}</a></h2>
        <p>{this.props.post.description}</p>
      </section>
      );
  }
});

var playlistItem = react.createClass({
  displayName: 'Playlist Post',

  render: function () {
    return (
      <section key={this.props.ix} className="post video-post">
        <div className="title">
          <h4>FEATURED VIDEO <span>12W</span></h4>
          <ul>
            <li><a className="action share share-icon-vevo" /></li>
            <li><a className="action add add-icon-vevo" /></li>
          </ul>
        </div>
        <img src={this.props.post.image} />
        <h2><a href={'/playlist/'+this.props.post.isrc} onClick={this.internalClick}>{this.props.post.name}</a></h2>
        <p>{this.props.post.description}</p>
      </section>
      );
  }
});

var nowFeed = react.createClass({

  displayName: 'Now Feed',

  getInitialState: function() {
    return {
      page: this.props.page || 1
    }
  },

  render: function () {
    var maxItems = this.state.page*5;
    return (
      <div className="now-feed-component">
        {this.props.data.nowPosts.map(function(post, ix) {
          if(ix > maxItems) return null;
          switch(post.type) {
            case 'video':
              return videoItem({ix:ix, post:post})
            case 'link':
              return linkItem({ix:ix, post:post})
            case 'artists':
              return artistsItem({ix:ix, post:post})
            case 'playlist':
              return playlistItem({ix:ix, post:post})
            default:
              return (
                <pre key={ix}>{JSON.stringify(post, null,2)}</pre>
                )
          }
        })}
      </div>
      );
  }
});

module.exports = nowFeed;