import { defineConfig } from '@rspack/cli';
import rspack from '@rspack/core';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import path from 'node:path';
export default defineConfig({
  resolve: { modules: [path.resolve('node_modules'), 'node_modules'], alias: {
    '@nsnanocat/util': path.resolve('vendor/nsnanocat-util/index.js'),
    '@nsnanocat/url': path.resolve('vendor/nsnanocat-url/URL.mjs'),
  } },
  entry: { 'HBO.Translate.response': './src/Translate.response.js' },
  output: { path: path.resolve('scripts'), chunkFormat: false, filename: '[name].bundle.js', library: { type: 'module' } },
  plugins: [new NodePolyfillPlugin(), new rspack.BannerPlugin({ banner: 'HBO AI Subtitles 0.1.0 — JerseyRiver. GPL-3.0-only.\nAdapted from AppleTV AI Subtitles / DualSubs Universal (VirgilClyne).\nFull third-party licenses: LICENSES.txt and NOTICE in the distribution.' })], devtool: false, performance: false,
});
