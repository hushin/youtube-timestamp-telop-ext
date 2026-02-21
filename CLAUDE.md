## プロジェクト概要

YouTube のタイムスタンプ付きコメントをニコニコ風弾幕として再生する Chrome / Firefox 拡張機能。

## コマンド

```bash
pnpm dev             # 開発ビルド（watchモード / Chrome）
pnpm dev:firefox     # 開発ビルド（watchモード / Firefox）
pnpm build           # プロダクションビルド → .output/chrome-mv3/
pnpm build:firefox   # プロダクションビルド → .output/firefox-mv2/
pnpm zip             # Chrome 向け zip（ストア申請用）
pnpm zip:firefox     # Firefox 向け zip
pnpm check           # svelte-check で型チェック
pnpm fmt             # oxfmt でフォーマット
pnpm lint            # oxlint で静的解析
```

ビルド成果物は `.output/` に出力される。Chrome には `.output/chrome-mv3/` を「パッケージ化されていない拡張機能」として読み込む。

## アーキテクチャ

WXT フレームワーク + Svelte 5 を使用した拡張機能。Content Script として YouTube の動画ページに注入される。

```
src/
├── entrypoints/
│   ├── content/
│   │   ├── index.ts        … Content script エントリ（オーケストレーション）
│   │   ├── App.svelte      … メインUIコンポーネント（パネル・一覧・設定）
│   │   ├── state.svelte.ts … Svelte 5 runes によるグローバルステート
│   │   └── style.css
│   ├── popup/              … 拡張機能ポップアップ（Svelte）
│   └── background.ts       … Service worker
└── lib/
    ├── types.ts             … 共通型定義
    ├── config.ts            … 設定の読み書き（browser.storage）
    ├── parser.ts            … タイムスタンプ正規表現パース、重複除去
    ├── api.ts               … YouTube Data API v3 クライアント（ページネーション対応）
    └── renderer.ts          … 弾幕エンジン（24fps setInterval、レーン管理、一時停止同期）
```

- **content/index.ts** がオーケストレーター。各モジュールを結合し、動画の再生時刻を 200ms ごとに監視して弾幕を発射する
- **state.svelte.ts** の `DanmakuState` が Svelte 5 runes（`$state`）でリアクティブなグローバル状態を管理
- **App.svelte** がパネル UI を構築。`danmakuState` を直接参照し、`onFetch` / `onToggle` / `onSeek` コールバックで `index.ts` と疎結合
- **renderer.ts** の `DanmakuRenderer` クラスが描画を担当。`setInterval(41.67ms)` = 24fps でアニメーション。動画が paused なら startTime をフレーム分ずらして弾幕を停止

## 重要な設計判断

- **手動トリガーがデフォルト**: `config.autoFetch = false`。ユーザーが「コメント取得」ボタンを明示的に押す。設定で自動に切替可能
- **YouTube Data API v3 使用**: DOM スクレイピングは YouTube の DOM 変更に脆弱なため API 方式を採用。API キーはユーザーが自分で取得して設定する
- **24fps アニメーション**: `setInterval` ベース。`requestAnimationFrame` ではなく固定フレームレート
- **レーン管理**: 弾幕が重ならないよう、空きレーンを時間ベースで管理。全レーン使用中なら最も早く空くレーンを使用
- **一時停止同期**: 動画 pause 時に各弾幕の `startTime` を 1 フレーム分ずらすことで位置を凍結
- **SPA 対応**: YouTube は SPA なので `setInterval(1000)` で URL 変更を監視し、動画遷移時にリセット＆再初期化
- **WXT の `browser` グローバル**: `chrome.*` ではなく WXT が提供する `browser.*` API を使用（Chrome / Firefox 統一）

## コーディング規約

- TypeScript strict モード
- Svelte 5 runes（`$state`, `$derived`, `$effect`）を使用。Options API 形式は使わない
- DOM 操作は `App.svelte` に集約。`renderer.ts` の弾幕要素生成は例外
- `browser.*` API の呼び出しは `config.ts` に集約
- ランタイム外部ライブラリの依存はゼロ（Svelte は devDependencies でコンパイル時に消える）
- CSS クラス名は `danmaku-` プレフィックス、ID は `danmaku-` プレフィックス
- フォーマットは `pnpm fmt`、リントは `pnpm lint`

## YouTube Data API の制約

- 無料クォータ: 10,000 ユニット/日
- `commentThreads.list`: 1 ユニット/リクエスト、最大 100 件/ページ
- ページネーション上限を 30 ページ（3,000 件）に設定
- コメント無効な動画は `commentsDisabled` エラーが返る

## 既知の制限

- 返信コメント（リプライ）のタイムスタンプは取得していない（`commentThreads` の `topLevelComment` のみ）
- コメント投稿機能はない（読み取り専用）
- API キーがないと動作しない
