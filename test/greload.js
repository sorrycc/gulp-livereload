/*jshint strict:false, unused:false */
describe('gulp-livereload', function() {
  var gutil = require('gulp-util'),
      sinon = require('sinon'),
      greload = require('../'),
      tinylr = require('tiny-lr'),
      should = require('should'),
      file = new gutil.File({
      path: '/foo/bar.css'
    });
  it('reloads file passing a livereload server instance', function(done) {
    var server = tinylr();
    var reload = greload(server);
    var spy = sinon.spy(server, 'changed');
    reload.end(file);
    reload.on('data', function(file) {
      should(spy.calledWith({
        body: {
          files: [file.path]
        }
      })).ok;
      server.changed.restore();
      done();
    });
  });
  it('reloads file passing a port number', function(done) {
    var port = 35730;
    var reload = greload(port);
    var spy = sinon.spy(greload.servers[port], 'changed');
    reload.end(file);
    reload.on('data', function(file) {
      should(spy.calledWith({
        body: {
          files: [file.path]
        }
      })).ok;
      done();
    });
  });
  it('reloads file using default port if given no parameter at all', function(done) {
    var reload = greload();
    var port = 35729;
    var spy = sinon.spy(greload.servers[port], 'changed');
    reload.end(file);
    reload.on('data', function(file) {
      should(spy.calledWith({
        body: {
          files: [file.path]
        }
      })).ok;
      greload.servers[port].changed.restore();
      done();
    });
  });
  it('displays debug messages', function() {
    var gutil = require('gulp-util');
    var port = 35727;
    var reload = greload(port);
    var spy = sinon.spy(gutil, 'log');

    greload.changed('foo/bazbar.txt');
    spy.calledWith(gutil.colors.magenta('bazbar.txt') + ' was reloaded.').should.not.be.ok;

    process.env.NODE_DEBUG = 'livereload';
    greload.changed('foo/bazbar.txt');
    spy.calledWith(gutil.colors.magenta('bazbar.txt') + ' was reloaded.').should.be.ok;
    process.env.NODE_DEBUG = null;
  });
  it('exposes tiny-lr middleware', function() {
    (typeof greload.middleware).should.eql('function');
  });
  describe('.changed', function() {
    it('works', function() {
      var port = 35728;
      var reload = greload.listen(port);
      var spy = sinon.spy(greload.servers[port], 'changed');
      greload.changed('foo/bar.txt', reload);
      should(spy.calledWith({
        body: {
          files: ['foo/bar.txt']
        }
      })).ok;
    });
    it('works', function() {
      var port = 35726;
      var reload = greload.listen(port);
      var spy = sinon.spy(greload.servers[port], 'changed');
      greload.changed(file, reload);
      should(spy.calledWith({
        body: {
          files: ['/foo/bar.css']
        }
      })).ok;
    });
    it('works on default port', function() {
      var reload = greload.listen();
      var spy = sinon.spy(greload.servers[35729], 'changed');
      greload.changed('/me.img');
      should(spy.calledWith({
        body: {
          files: ['/me.img']
        }
      })).ok;
    });
  });
});
