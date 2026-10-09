import io
import zipfile
import tempfile
import unittest
import urllib.parse
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

from app import Cue, GatewayError, HBOSubtitleGateway, MediaRequest, RequestHandler, SubtitleGateway, VTT_TIMESTAMP_MAP, parse_srt_or_vtt, render_vtt


class HBOTests(unittest.TestCase):
    asset = '53395a57-ee38-4220-b07a-882eb64faf73'

    def query(self, **kwargs):
        return {k: [str(v)] for k, v in dict(title='Example', duration=2100, **kwargs).items()}

    def test_identity_rejects_paths_and_missing_episode(self):
        for asset in ('../apple/1234', '1234', self.asset + '/bad'):
            with self.assertRaises(GatewayError):
                HBOSubtitleGateway.media_request(asset, self.query())
        with self.assertRaises(GatewayError):
            HBOSubtitleGateway.media_request(self.asset, self.query(type='tv', season=1))
        media = HBOSubtitleGateway.media_request(self.asset, self.query(type='tv', season=1, episode=2))
        other = HBOSubtitleGateway.media_request(self.asset, self.query(type='tv', season=1, episode=3))
        self.assertNotEqual(media.asset_id, other.asset_id)
        self.assertTrue(media.asset_id.startswith('hbo-'))

    def test_cache_platform_metadata_and_zero_mapping(self):
        with tempfile.TemporaryDirectory() as root:
            config = SimpleNamespace(cache_dir=Path(root), max_cache_entries=200)
            hbo = HBOSubtitleGateway(config)
            media = hbo.media_request(self.asset, self.query())
            hbo.resolve = lambda *args: ([Cue(8300, 11300, '字幕')], 'test:HMAX', [], None, {})
            vtt, _ = hbo.get_vtt(media)
            self.assertIn('MPEGTS:0', vtt)
            self.assertNotIn(VTT_TIMESTAMP_MAP, vtt)
            self.assertEqual(parse_srt_or_vtt(vtt)[0].start_ms, 8300)
            meta = hbo.read_metadata(media)
            self.assertEqual(meta['platform'], 'hbo')
            self.assertFalse(meta['selection'].get('timing_verified', False))
            apple = SubtitleGateway(config)
            apple_media = MediaRequest.from_query('123456', self.query())
            self.assertNotEqual(apple.cache_path(apple_media), hbo.cache_path(media))
            self.assertIn(VTT_TIMESTAMP_MAP, apple.prepare_vtt(render_vtt([Cue(1, 1000, 'Apple')])))
            hbo.resolve = lambda *args: self.fail('Must reuse HBO cache')
            self.assertEqual(hbo.get_vtt(media)[1], 'cache')

    def test_hbo_release_preferred_over_apple_without_sampling_media(self):
        with tempfile.TemporaryDirectory() as root:
            gateway = HBOSubtitleGateway(SimpleNamespace(cache_dir=Path(root)))
            media = gateway.media_request(self.asset, self.query())
            apple = dict(name='Example.ATVP.WEB-DL.srt')
            hbo = dict(name='Example.HMAX.WEB-DL.srt')
            gateway.search_subdl = lambda *args: [apple, hbo]
            calls = []
            def download(media, candidate):
                calls.append(candidate['name'])
                return b'1\n00:34:40,000 --> 00:34:50,000\nHello\n', candidate['name'], candidate['name']
            gateway.download_candidate_cached = download
            gateway.select_english_reference(media, {}, '')
            self.assertEqual(calls, [hbo['name']])
            self.assertEqual(gateway.fetch_apple_captions(media), [])

    def test_authenticated_http_route_filters_and_offsets_without_changing_cache(self):
        handler = object.__new__(RequestHandler)
        handler.server = SimpleNamespace(gateway=SimpleNamespace(config=SimpleNamespace(access_token='test', cache_dir=Path('/tmp'))))
        handler.path = '/v1/test/hbo/' + self.asset + '/subtitle.vtt?' + urllib.parse.urlencode(dict(title='Example', duration=2100, **{'from': 5, 'to': 10, 'offset': 2}))
        responses = []
        handler.send_text = lambda body, kind, **kwargs: responses.append((body, kind, kwargs))
        handler.send_json = lambda *a, **k: self.fail('Unexpected JSON error')
        handler.send_error = lambda *a: self.fail('Unexpected HTTP error')
        source = render_vtt([Cue(1000, 4000, 'before'), Cue(4000, 9000, 'cross'), Cue(12000, 14000, 'after')])
        with patch.object(HBOSubtitleGateway, 'get_vtt', return_value=(source, 'mock')):
            handler.do_GET()
        cues = parse_srt_or_vtt(responses[0][0])
        self.assertEqual([(c.start_ms, c.end_ms, c.text) for c in cues], [(5000, 6000, 'before'), (6000, 10000, 'cross')])
        self.assertIn('MPEGTS:0', responses[0][0])
        self.assertIn('00:00:01.000', source)
        self.assertEqual(responses[0][2]['headers']['X-Subtitle-Platform'], 'hbo')
        handler.path = handler.path.replace('/v1/test/', '/v1/wrong/')
        errors = []
        handler.send_error = lambda status: errors.append(status)
        handler.do_GET()
        self.assertEqual(errors, [404])

    def test_season_pack_selects_exact_episode_not_largest_file(self):
        output = io.BytesIO()
        with zipfile.ZipFile(output, 'w') as archive:
            archive.writestr('Show.S01E01.srt', 'wrong' * 500)
            archive.writestr('Show.S01E02.srt', 'right episode')
            archive.writestr('Show.S01E02-E03.srt', 'ambiguous' * 500)
        config = SimpleNamespace(cache_dir=Path('/tmp'), timeout_seconds=5, subdl_api_key='mock')
        gateway = HBOSubtitleGateway(config)
        item = dict(url='/show.zip', name='Show.S01.zip', _hbo_season=1, _hbo_episode=2)
        with patch('app.request_bytes', return_value=(output.getvalue(), {'Content-Type': 'application/zip'})):
            data, name, label = gateway.download_candidate(item)
        self.assertEqual(data, b'right episode')
        self.assertEqual(name, 'Show.S01E02.srt')
        with patch('app.request_bytes', return_value=(output.getvalue(), {'Content-Type': 'application/zip'})):
            with self.assertRaises(GatewayError):
                gateway.download_candidate({**item, '_hbo_episode': 4})
        self.assertFalse(gateway.episode_matches('Show.S01E02E03.srt', 1, 2))
        self.assertTrue(gateway.episode_matches('Show.1x02.srt', 1, 2))

    def test_log_redacts_both_platform_tokens(self):
        handler = object.__new__(RequestHandler)
        handler.client_address = ('127.0.0.1', 1000)
        with patch('app.LOG.info') as log:
            handler.log_message('%s', 'GET /v1/secret/hbo/' + self.asset)
            self.assertNotIn('secret', str(log.call_args))
            handler.log_message('%s', 'GET /v1/secret/apple/1234')
            self.assertNotIn('secret', str(log.call_args))


if __name__ == '__main__':
    unittest.main()
