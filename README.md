
# How it works
Germ bootstraps your application environment such that key components that need to differn on the server version client are injected. For example, the data assess layer needs to act diffrently on the client and server.
To make routes consistent in both the server and client. Germ impliments its own basic routing and does not relay on expressjs routing. The allows the code to be composed in such a way the res,res, and server side data is not need in the routhing process.

# Basic Build Idea
We have assets (this is all our raw static files that will get processed in a pipeline into our served files.
You can find all the serviced files in www
then in addition to to just assets we have vender assets that are managed by bower. We also have vender/*.packages that help in the pipeline to pull out important files from the bower package into the vender prefiex dir. This will let other build function pick up later

# react
# test: chai, karma,joi, mocha

# webpack
## less,sass,stylus, autoprefixer
## rupture
## jeet (axis-css)
## sweetjs

# logging: email, + stream
# Docs: jsdoc jaduarjs (todo let other md files get added and add deply page)

# development: sourcemaps, browser-sync, jshint

# server spdy, nconf, commander, envify, cluster-master
 
# deply: conventional changelog, nodegit, 

# app: expressjs, lru, fibers, superagent

# transations: messageformat

## License

Apache 2.0
Copyright Demetrius Johnson
