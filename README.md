
# How it works

Germ bootstraps your application environment such that key components need only on the server or client are injected when appropriate. For example, the data assess layer needs to act diffrently on the client and server.

To make routes consistent in both the server and client, Germ impliments its own basic routing using [crossroads][] and does not relay on expressjs routing. The allows the routing code to run independently of both the server environment and the client context.

# Basic Build Idea

We have assets (this is all our raw static files that will get processed in a pipeline into our served files.
You can find all the serviced files in www
then in addition to to just assets we have vendor assets that are managed by bower. We also have vendor/*.packages that help in the pipeline to pull out important files from the bower package into the vender prefix dir. This will let other build function pick up later

# Technologies used

- Routing
  - [crossroads][]

- Views
 - [react][]

- test
  - chai
  - karma
  - joi
  - mocha

- webpack
  - less,sass,stylus, autoprefixer
  - rupture
  - jeet (axis-css)
  - sweetjs

- logging
  - email
  - stream
- Docs
  - jsdoc
  - aduarjs
  - (todo let other md files get added and add deploy page)

- development
  - sourcemaps
  - browser-sync
  - jshint

- server
  - spdy
  - nconf
  - commander
  - envify
  - cluster-master
 
- deploy
  - conventional changelog
  - nodegit

- app
  - expressjs
  - lru
  - fibers
  - superagent

- translations
  - messageformat

## License

Apache 2.0
Copyright Demetrius Johnson

<!-- links -->
[crossroads]: https://millermedeiros.github.io/crossroads.js/ "Crossroads, a routing library that does nothing except routing, and which runs in multiple environments"
[react]: https://facebook.github.io/react/
