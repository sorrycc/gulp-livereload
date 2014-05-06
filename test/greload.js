/*jshint strict:false, expr:true */
describe('gulp-livereload', function() {
  var gutil = require('gulp-util'),
      sinon = require('sinon'),
      greload = require('../'),
      tinylr = require('tiny-lr');

  require('should');

  it('works when an lr instance is passed', function(done) {
    var server = tinylr();
    var reload = greload(server);
    var spy = sinon.spy(server, 'changed');
    reload.end(new gutil.File({
      path: '/an-lr-instance.css'
    }));
    reload.once('data', function() {
      spy.calledWith({ body: { files: ['/an-lr-instance.css'] } }).should.ok;
      server.changed.restore();
      spy.restore();
      done();
    });
  });
  it('works when a port number is passed', function(done) {
    var port = 35730,
        reload = greload(port),
        spy = sinon.spy(),
        stub = sinon.stub(greload, 'listen').returns({ changed: spy });
    reload.end(new gutil.File({ path: '/a-port-number.css' }));
    reload.once('data', function() {
      spy.calledWith({ body: { files: ['/a-port-number.css'] } }).should.ok;
      stub.restore();
      done();
    });
  });
  it('works when no parameter is passed', function(done) {
    var reload = greload(),
        spy = sinon.spy(),
        stub = sinon.stub(greload, 'listen').returns({ changed: spy });
    reload.end(new gutil.File({ path: '/use-default-port.css' }));
    reload.on('data', function() {
      spy.calledWith({ body: { files: ['/use-default-port.css'] } }).should.ok;
      stub.restore();
      done();
    });
  });
  it('displays debug messages', function() {
    var port = 35727;
    var spy = sinon.spy();
    var stub = sinon.stub(gutil, 'log', spy);
    var mock = sinon.mock(greload);
    var spy2 = sinon.spy();

    mock.expects('listen').twice().withArgs(port).returns({ changed: spy2});

    process.env.NODE_DEBUG = 'livereload';
    greload.changed('/css/debug-message.css', port);
    spy.calledWith(
      gutil.colors.magenta('debug-message.css') + ' was reloaded.'
    ).should.ok;
    spy.reset();

    process.env.NODE_DEBUG = null;
    greload.changed('/js/debug-message.js', port);
    spy.calledWith(
      gutil.colors.magenta('debug-message.js') + ' was reloaded.'
    ).should.not.ok;
    spy2.calledTwice.should.ok;
    stub.restore();
    mock.restore();
  });
  it('exposes tiny-lr middleware', function() {
    (typeof greload.middleware).should.eql('function');
  });
  describe('.listen', function() {
    it('works', function() {
      var port = 35725;
      var mock = sinon.mock(greload);
      mock.expects('listen').once().withArgs(port);
      greload.listen(port);
      mock.restore();
    });
  });
  describe('.changed', function() {
    it('works', function() {
      var port = 35728;
      var spy = sinon.spy();
      var mock = sinon.mock(greload);

      mock.expects('listen').once().withArgs(port).returns({ changed: spy });
      greload.changed('/changed-works.html', port);
      spy.calledWith({ body: { files: ['/changed-works.html'] } }).should.ok;
      mock.restore();
    });
    it('works on watch event objects', function() {
      var port = 35726;
      var spy = sinon.spy();
      var mock = sinon.mock(greload);

      mock.expects('listen').once().withArgs(port).returns({ changed: spy });
      greload.changed({ type: 'added', path: '/js/event-objects.js' }, port);
      spy.calledWith({ body: { files: ['/js/event-objects.js'] } }).should.ok;
      mock.restore();
    });
    it('works on default port', function() {
      var spy = sinon.spy();
      var mock = sinon.mock(greload);

      mock.expects('listen').once().withArgs(undefined).returns({ changed: spy });
      greload.changed('/changed-on-default-port.html');
      spy.calledWith(
        { body: { files: ['/changed-on-default-port.html'] } }
      ).should.ok;
      mock.restore();
    });
  });
});
