import { expect as chaiExpects } from 'chai';

import {
  parseLink,
} from './youtube';


describe('service/virtualEvent/youtube', () => {
  describe('parseUrl', () => {
    it('has minimum requirements', () => {
      chaiExpects( parseLink(<unknown>null as string) ).to.equal(null);
      chaiExpects( parseLink('') ).to.equal(null);
      chaiExpects( parseLink('http-ish String') ).to.equal(null);

      // it('constrains on domain')
      chaiExpects( parseLink('https://not-youtube.com/dQw4w9WgXcQ') ).to.equal(null);

      // it('requires a Stream ID')
      chaiExpects( parseLink('https://youtube.com?t=43') ).to.equal(null);
      chaiExpects( parseLink('https://youtu.be/?t=43') ).to.equal(null);
    });


    describe('from a full URL', () => {
      it('parses a URL', () => {
        const TEXT = 'https://youtube.com/watch?v=dQw4w9WgXcQ&t=43';

        chaiExpects( parseLink(TEXT) ).to.deep.equal({
          urlLinkText: TEXT,
          streamId: 'dQw4w9WgXcQ',
          passwordDetected: false,
        });

        // it('honors sub-domains')
        chaiExpects( parseLink('https://www.youtube.com/watch?v=dQw4w9WgXcQ') ).to.include({
          streamId: 'dQw4w9WgXcQ',
        });
      });
    });


    describe('from a shortened URL', () => {
      it('parses a URL', () => {
        const TEXT = 'https://youtu.be/dQw4w9WgXcQ?t=43';

        chaiExpects( parseLink(TEXT) ).to.deep.equal({
          urlLinkText: TEXT,
          streamId: 'dQw4w9WgXcQ',
          passwordDetected: false,
        });
      });
    });
  });
});
