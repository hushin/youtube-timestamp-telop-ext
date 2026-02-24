# Chrome Web Store 画像生成

YouTube Timestamp Telop 拡張の Web Store 掲載用画像を HTML → PNG で生成するツール。

## ファイル構成

```
icon/
├── icon.html         … アイコン用 HTML (128x128)
├── promo.html        … プロモーション画像（小）用 HTML (440x280)
├── screenshot.html   … スクリーンショット用 HTML (1280x800)
├── capture.js        … 上記 HTML を puppeteer + sharp で PNG 化するスクリプト
├── icon.png          … 生成済みアイコン
├── promo_small.png   … 生成済みプロモーション画像
├── screenshot_1.png  … 生成済みスクリーンショット
└── image.png         … デザイン参考用の実際のスクリーンショット
```

## 使い方

```bash
cd ai-out
npm install        # 初回のみ
node capture.js    # 3 つの PNG を一括生成
```

## 画像仕様

| ファイル | HTML サイズ (viewport) | 出力サイズ | 用途 |
|---|---|---|---|
| icon.png | 256x256 (2x) | 128x128 | 拡張アイコン（透過 PNG） |
| promo_small.png | 880x560 (2x) | 440x280 | Web Store プロモーション画像（小） |
| screenshot_1.png | 2560x1600 (2x) | 1280x800 | Web Store スクリーンショット |

すべて `deviceScaleFactor: 2` でキャプチャし、sharp で正規サイズにリサイズ。Retina 品質を確保。

## デザイン方針

- **コンセプト**: YouTube ダークモード + ニコニコ風弾幕
- **カラー**: 背景 `#0f0f0f`、YouTube レッド `#ff0033`、テキスト `#ffffff`
- **フォント**: Noto Sans JP（日本語）、Orbitron（英数字）、Roboto（UI）— すべて Google Fonts CDN

### icon.png
- 赤い角丸の再生ボタン（▶）の上を白い線が横切るデザイン
- テキストなし。16x16 縮小でも再生ボタンが認識できるシンプルさ

### promo_small.png
- アイコン + タイトル（Timestamp Telop）+ 白い流れるコメント
- 要素は最小限。コメントは白色のみ、タイムスタンプなし

### screenshot_1.png
- YouTube 風ダークモードの動画ページを再現
- 動画上に白いコメントが弾幕表示
- 右パネルに拡張 UI（タイムスタンプコメント一覧 + ボタン）
- 参考: `image.png`（実際の使用時スクリーンショット）

## 編集のヒント

### HTML を直接ブラウザで確認
各 HTML はそのままブラウザで開いてプレビュー可能。Chrome DevTools でリアルタイム調整してから HTML に反映すると効率的。

### よくある調整

- **コメント内容を変更**: HTML 内の `.telop` / `.comment` / `.flow-comment` 要素のテキストを編集
- **コメントの位置**: CSS の `top` / `left` を調整
- **コメントの密度**: HTML 要素を増減
- **色の変更**: CSS の `color` / `background` / `opacity` を調整
- **フォントが読み込めない場合**: `capture.js` の `setTimeout(r, 2000)` の値を増やす

### 新しいスクリーンショットを追加
`capture.js` の `configs` 配列に新しいエントリを追加:

```js
{
  name: 'screenshot_2',
  html: 'screenshot2.html',
  output: 'screenshot_2.png',
  viewportWidth: 2560,
  viewportHeight: 1600,
  outputWidth: 1280,
  outputHeight: 800,
  deviceScaleFactor: 2,
  transparent: false,
},
```

## Chrome Web Store 画像要件

- [公式ドキュメント](https://developer.chrome.com/docs/webstore/images)
- アイコン: 128x128（96x96 アートワーク + 16px 透明パディング）
- プロモーション画像（小）: 440x280（必須）
- スクリーンショット: 1280x800 推奨、最低 1 枚・最大 5 枚
