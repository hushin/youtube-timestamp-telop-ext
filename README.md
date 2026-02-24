# YouTube Timestamp Telop

YouTubeのタイムスタンプ付きコメントをニコニコ動画風の流れるコメントとして表示するブラウザ拡張機能です。

## 機能

- YouTube Data API v3 でコメントを取得し、タイムスタンプ（`1:23` / `01:23:45`）付きコメントを自動検出
- 動画の再生時刻に同期して、ニコニコ風に右→左へコメントが流れる
- 動画の一時停止・シークに連動してコメントも停止・リセット
- コメント一覧パネル（クリックでその時刻にジャンプ）
- 文字サイズ・透明度・速度・密度をリアルタイム調整
- 手動取得がデフォルト（設定で自動取得に切替可能）
- YouTube SPA ナビゲーション対応
- Chrome / Firefox 両対応

## セットアップ

### 前提条件

- Node.js 18+
- pnpm
- YouTube Data API v3 の API キー（[取得ガイド](docs/API_KEY_SETUP.md)）

### インストール

```bash
git clone <this-repo>
cd youtube-timestamp-telop-ext
pnpm install
```

### ビルド

```bash
# 開発（watchモード）
pnpm dev
pnpm dev:firefox

# プロダクション
pnpm build
pnpm build:firefox

# zip化（ストア申請用）
pnpm zip
pnpm zip:firefox

# 型チェック（Svelte）
pnpm check
```

ビルド成果物は `.output/` に出力されます。

### Chrome にインストール

1. `pnpm build` を実行
2. Chrome で `chrome://extensions` を開く
3. 「デベロッパーモード」を ON
4. 「パッケージ化されていない拡張機能を読み込む」で `.output/chrome-mv3/` フォルダを選択

### API キーの設定

1. YouTube の動画ページを開く
2. プレーヤー下のコメントパネルで「⚙ 設定」をクリック
3. API Key 欄にキーを入力 →「保存」

取得方法の詳細は [docs/API_KEY_SETUP.md](docs/API_KEY_SETUP.md) を参照してください。

## 使い方

1. YouTube の動画ページにアクセス
2. プレーヤー下の「コメント取得」ボタンをクリック
3. タイムスタンプ付きコメントが検出され、流れるコメントとして表示される
4. コメント一覧からクリックでその時刻にジャンプ

## プロジェクト構成

```
youtube-timestamp-telop-ext/
├── src/
│   ├── entrypoints/
│   │   ├── content/
│   │   │   ├── index.ts        # Content script エントリ（オーケストレーション）
│   │   │   ├── App.svelte      # メインUIコンポーネント（パネル・一覧・設定）
│   │   │   ├── state.svelte.ts # Svelte 5 runes によるグローバルステート
│   │   │   └── style.css       # Content script スタイル
│   │   ├── popup/
│   │   │   ├── index.html
│   │   │   ├── main.ts
│   │   │   ├── App.svelte
│   │   │   └── app.css
│   │   └── background.ts       # Service worker
│   └── lib/
│       ├── types.ts            # 共通型定義
│       ├── config.ts           # 設定の読み書き（browser.storage）
│       ├── parser.ts           # タイムスタンプ解析・コメント抽出
│       ├── api.ts              # YouTube Data API v3 クライアント
│       └── renderer.ts         # コメントレンダリングエンジン（24fps, レーン管理）
├── .output/                    # ビルド成果物（gitignore）
├── wxt.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 技術スタック

- **TypeScript** — 型安全なコードベース
- **Svelte 5** — UI コンポーネント・リアクティブステート（runes）
- **WXT** — ブラウザ拡張フレームワーク（Chrome / Firefox 統一ビルド）
- **Chrome Extension Manifest V3**
- **YouTube Data API v3** — コメント取得

## 設定項目

| 設定       | デフォルト | 説明                             |
| ---------- | ---------- | -------------------------------- |
| 文字サイズ | 28px       | コメントのフォントサイズ         |
| 透明度     | 85%        | コメントの不透明度               |
| 速度       | 8秒        | 画面横断にかかる時間             |
| 自動取得   | OFF        | ページ読込時にコメントを自動取得 |

## ライセンス

[MIT](LICENSE)
