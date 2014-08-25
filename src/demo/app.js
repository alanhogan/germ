var crossroads = require('crossroads')
  , react = require('react')
  , bacon = require('baconjs')
  , layout = require('./template/layout.jsx');

// crappy hack because react-intl is not clean
global.Intl = require('intl');

/**
 * GeRM demo application
 *
 * $class
 */
function app() {
  this.clientData = false;

  // setup the default event channel
  this.eventChannel = new bacon.Bus();
  this.renderChannel = new bacon.Bus();

  // create a router to let component register on
  this.routes = crossroads.create();
  this.routes.ignoreState = true;

  // shorthand to help components
  this.react = react;
  this.dom = react.DOM;

  // create a lookup table for root components
  // this is used on server/client side binding
  this.rootComponentLookup = {};

  if(CLIENT_ENV) {
    window.app = this; // used by bootstrap (server emit code app.bootstrap(...) script
    this.layoutComponent = null;
    this.watchHistory();
  }

  // todo: need to load and have control over this!
  this.i18n = {
    locales: ['en-US'],
    messages: {
      "en-US": {
        reporting: "{employee} reports to {manager}."
      },

      "de-DE": {
        reporting: "{employee} berichtet an {manager}."
      }
    }
  };

  // handle the root component renders. We needed to support both the server and client bootstrap logic
  this.renderChannel.filter(function(val) {return !val.target;}).onValue(this.onRenderRootComponent); //.bind(this) for client side
}

/**
 * Que a render event
 *
 * @param component
 * @param meta
 * @param target
 * @param res
 */
app.prototype.renderComponent = function(component, meta, target, req, res, serializeState) {
  var event = {
    component: component,
    meta: meta,
    target: target
  };

  // merge in server side information
  if(req && res) {
    event.req = req;
    event.res = res;
  }

  if(serializeState) {
    event.id = serializeState.id;
    event.props = serializeState.props;
  }

  this.renderChannel.push(event);
}

/**
 * Render a root component in the layout for both server and client environments
 *
 * @param message
 */
app.prototype.onRenderRootComponent = function(message) {
  var app = module.exports;

  if(CLIENT_ENV) {
    if(!message.component) {
      console.error('Error no root component to render', message);
      throw new Error('Root component required to render');
    }

    if(app.layoutComponent) {
      app.layoutComponent.setState({body: message.component, meta: message.meta});
      window.scrollTo(0,0);
    } else {
      app.layoutComponent = react.renderComponent(
        layout({body:message.component, meta:message.meta, locales:app.i18n.locales, messages:app.i18n.messages['en-US']}),
        message.target || document.getElementById('__APP__')
      );
    }

    // allow dynamic title updating via route
    if(message.meta && message.meta.title) {
      document.title = message.meta.title;
    }
  } else if(message.res) {
    // ignore if non server event
    if(message.component) {
      var markup;

      var ourBodyScripts = '<script src="//cdnjs.cloudflare.com/ajax/libs/history.js/1.8/native.history.min.js"></script>'+
        '<script src="//cdnjs.cloudflare.com/ajax/libs/react/0.11.1/react-with-addons.js"></script>'+
        '<script src="/js/demo.js"></script>';

      // for bots only return the markup with out react state and bootstrap call
      if(/googlebot|gurujibot|twitterbot|yandexbot|slurp|msnbot|bingbot|rogerbot|facebookexternalhit/i.test(message.req.headers['user-agent']||'')) {
        markup = react.renderComponentToStaticMarkup(layout({body:message.component, meta:message.meta, locales:app.i18n.locales, messages:app.i18n.messages}));
      } else {
        markup = react.renderComponentToString(layout({body:message.component, meta:message.meta, locales:app.i18n.locales, messages:app.i18n.messages}));

        if(message.id) {
          ourBodyScripts += '<script>app.bootstrap("'+message.id+'",'+JSON.stringify(message.props)+','+JSON.stringify(message.meta)+');</script>';
        }
      }

      ourBodyScripts += '<!-- Google Analytics: change UA-XXXXX-X to be your site\'s ID. -->\n'+
      '<script>\n'+
        '(function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=\n'+
        'function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;\n'+
        'e=o.createElement(i);r=o.getElementsByTagName(i)[0];\n'+
        'e.src=\'//www.google-analytics.com/analytics.js\';\n'+
        'r.parentNode.insertBefore(e,r)}(window,document,\'script\',\'ga\'));\n'+
        'ga(\'create\',\'UA-XXXXX-X\');ga(\'send\',\'pageview\');\n'+
      '</script>';

      // workaround because react does not support doctype or <!-- -->
      message.res.status((message.meta && message.meta.status) || 200);
      message.res.end('<!DOCTYPE html>\n'+
        '<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->\n'+
        '<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->\n'+
        '<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->\n'+
        '<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->\n'+
        '<head>'+
          '<meta charset="utf-8">'+
          '<meta http-equiv="X-UA-Compatible" content="IE=edge">'+
          ((message.meta && message.meta.title) ? '  <title>' + message.meta.title + '</title>' : '') +
          '<meta name="description" content="">'+
          '<meta name="viewport" content="width=device-width, initial-scale=1">'+
          '<script src="//polyfill.io"></script>'+
          '<script src="/js/demo-assets.js"></script>'+
        '</head>'+
        '<body>'+
          '<!--[if lt IE 7]>\n'+
          '<p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>\n'+
          '<![endif]-->\n'+
          '<div id="__APP__">'+
            markup +
          '</div>'+
          ourBodyScripts+
        '</body>'+
        '</html>');
    } else {
      message.res.send(500);
    }
  } else {
    console.error('Ignored renderRootComponent because not res object', message, CLIENT_ENV ? 'on client':'on server');
  }
}

/**
 * register a component to be safe to render on the server and
 * resume on the client.
 *
 * @param name
 * @param component
 */
app.prototype.registerRootComponent = function(component) {
  if(!component.type.displayName) {
    console.error('Can not register root component with no displayName');
    throw new Error('displayName is required to register root component');
  }

  if(this.rootComponentLookup[component.type.displayName]) {
    console.error('Can not have duplicate root component with the same name:', name);
    throw new Error('Can not have duplicate root component');
  }

  this.rootComponentLookup[component.type.displayName] = component;
}

/**
 * bootstrap the client app using server rendered data.
 */
app.prototype.bootstrap = function(id, props, meta) {
  this.clientData = meta && meta.clientData;

  if(!this.rootComponentLookup[id]) {
    console.error('Can not init serialize state because unknown component', id)
    throw new Error('Unknown component');
  }

  this.renderComponent(this.rootComponentLookup[id](props), meta);
}

/**
 * expressjs middleware to handle routing request
 *
 * @param req
 * @param res
 * @param next
 */
app.prototype.middleware = function (req, res, next) {
  var self = this;

  // forward the req, res, next to the routes handler because we are running in server envirment
  this.routes.parse(req.path, [
    {req: req, res: res, next: next},
    function (component, meta, target) {

      if(!component) return;

      var serializeState = null;
      if (component.type.displayName) {
        serializeState = {
          id: component.type.displayName,
          props: component.props
        };
      }

      self.renderComponent(component, meta, target, req, res, serializeState);
    }
  ]);
}

/**
 * handle html5 history events for routing
 */
app.prototype.watchHistory = function() {
  var self = this;

  // add a listener to the history statechange and route requests
  window.History.Adapter.bind(window, "statechange", function() {
    // TODO: parse document.location.search into metaData
    self.routes.parse(document.location.pathname, [{historyState:window.History.getState()}, function(component, meta, target) {
      self.renderComponent(component, meta, target);
    }]);
  });
}

module.exports = new app();
