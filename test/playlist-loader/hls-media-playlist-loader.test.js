import QUnit from 'qunit';
import videojs from 'video.js';
import HlsMediaPlaylistLoader from '../../src/playlist-loader/hls-media-playlist-loader.js';
import {useFakeEnvironment} from '../test-helpers';
import xhrFactory from '../../src/xhr';
import testDataManifests from 'create-test-data!manifests';

QUnit.module('HLS Media Playlist Loader', function(hooks) {
  hooks.beforeEach(function(assert) {
    this.env = useFakeEnvironment(assert);
    this.clock = this.env.clock;
    this.requests = this.env.requests;
    this.fakeVhs = {
      xhr: xhrFactory()
    };
    this.logLines = [];
    this.oldDebugLog = videojs.log.debug;
    videojs.log.debug = (...args) => {
      this.logLines.push(args.join(' '));
    };
  });
  hooks.afterEach(function(assert) {
    if (this.loader) {
      this.loader.dispose();
    }
    this.env.restore();
    videojs.log.debug = this.oldDebugLog;
  });

  QUnit.module('#start()');

  QUnit.test('requests and parses a manifest', function(assert) {
    assert.expect(8);
    this.loader = new HlsMediaPlaylistLoader('media.m3u8', {
      vhs: this.fakeVhs
    });

    let updatedTriggered = false;

    this.loader.on('updated', function() {
      updatedTriggered = true;
    });
    this.loader.start();

    assert.true(this.loader.started_, 'was started');
    assert.ok(this.loader.request_, 'has request');

    this.requests[0].respond(200, null, testDataManifests.media);

    assert.equal(this.loader.request_, null, 'request is done');
    assert.ok(this.loader.manifest(), 'manifest was set');
    assert.equal(this.loader.manifestString_, testDataManifests.media, 'manifest string set');
    assert.true(updatedTriggered, 'updated was triggered');
  });

  QUnit.module('#parseManifest_()');

});

