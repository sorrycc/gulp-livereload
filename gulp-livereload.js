'use strict';
var gutil = require('gulp-util'),
    path = require('path'),
    tinylr = require('tiny-lr'),
    Transform = require('stream').Transform,
    magenta = gutil.colors.magenta,
    defaultPort = 35729;

module.exports = exports = function (server) {
  var reload = new Transform({objectMode:true});

  server = exports.listen(server);

  reload._transform = function(file, encoding, next) {
    exports.changed(file.path, server);
    this.push(file);
    next();
  };

  return reload;
};

exports.middleware = tinylr.middleware;

exports.servers = exports.servers || {};

exports.listen  = function(server) {
  if (typeof server === 'undefined') {
    server = defaultPort;
  }
  if (typeof server === 'number') {
    var port = server;
    if (exports.servers[port]) {
      server = exports.servers[port];
    } else {
      exports.servers[port] = server = tinylr();
      server.listen(port, function (err) {
        if (err) {
          throw new gutil.PluginError('gulp-livereload', err.message);
        }
        gutil.log('Live reload server listening on: ' + magenta(port));
      });
    }
  }

  return server;
};

exports.changed = function(filePath, server) {
  server = server || exports.servers[defaultPort];
  filePath = filePath.hasOwnProperty('path')? filePath.path : filePath;
  if(process.env.NODE_DEBUG && process.env.NODE_DEBUG.match(/livereload/)) {
    gutil.log(magenta(path.basename(filePath)) + ' was reloaded.');
  }

  server.changed({
    body: {
      files: [filePath]
    }
  });
};
