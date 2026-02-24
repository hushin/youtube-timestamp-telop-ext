import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte', '@wxt-dev/auto-icons'],
  manifest: {
    name: 'YouTube Timestamp Telop - タイムスタンプコメント',
    version: '0.1.0',
    description: 'YouTubeのタイムスタンプ付きコメントを流れるコメントとして表示するブラウザ拡張',
    permissions: ['storage'],
  },
});
