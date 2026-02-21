import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    name: 'YouTube Danmaku Player - ニコニコ風弾幕コメント',
    version: '2.1.0',
    description: 'YouTubeのタイムスタンプ付きコメントをニコニコ風弾幕として再生するブラウザ拡張',
    permissions: ['storage'],
  },
});
