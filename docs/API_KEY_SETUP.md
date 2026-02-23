# YouTube Data API キー取得ガイド

この拡張機能は YouTube Data API v3 を使用してコメントを取得します。
利用には Google Cloud の API キーが必要です（無料枠で十分利用できます）。

---

## 1. Google Cloud プロジェクトを作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセスし、Google アカウントでログイン
2. 画面上部のプロジェクト選択メニューをクリック → 「新しいプロジェクト」
3. プロジェクト名を入力（例: `youtube-timestamp`）→ 「作成」をクリック
4. 作成したプロジェクトが選択されていることを確認

## 2. YouTube Data API v3 を有効化

1. 左メニュー → 「APIとサービス」 → 「ライブラリ」
2. 検索バーに `YouTube Data API v3` と入力
3. 「YouTube Data API v3」をクリック → 「有効にする」をクリック

## 3. API キーを作成

1. 左メニュー → 「APIとサービス」 → 「認証情報」
2. 画面上部の「+ 認証情報を作成」 → 「API キー」を選択
3. API キーが生成されるのでコピー

## 4. API キーを制限する（推奨）

セキュリティのため、キーの使用範囲を制限することを強く推奨します。

1. 作成した API キーの右側にある「編集」アイコン（鉛筆マーク）をクリック
2. 「API の制限」セクション → 「キーを制限」を選択
3. ドロップダウンから「YouTube Data API v3」にチェック
4. 「保存」をクリック

## 5. 拡張機能に設定

1. YouTube の動画ページを開く
2. プレーヤー下のタイムスタンプコメントパネルで「⚙ 設定」をクリック
3. 「API Key」欄にコピーしたキーを貼り付け → 「保存」をクリック
4. 「コメント取得」ボタンで動作確認

---

## 無料枠について

YouTube Data API v3 の無料クォータは **1日あたり 10,000 ユニット** です。

| 操作 | コスト |
|------|--------|
| `commentThreads.list` | 1 ユニット / リクエスト |
| 1リクエストの最大取得件数 | 100件 |

通常の使い方であれば、無料枠を超えることはほぼありません。

---

## トラブルシューティング

| エラー | 原因と対処 |
|--------|-----------|
| API キーが無効です | キーが正しくコピーされているか確認。Google Cloud Console で有効かチェック |
| APIアクセスが拒否されました | YouTube Data API v3 が有効化されているか確認。API キーの制限が厳しすぎないかチェック |
| コメントが無効になっています | 動画のオーナーがコメント欄を閉じています |
| クォータ超過 | 翌日（太平洋時間 0:00）にリセット。[クォータページ](https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas)で確認 |

---

## 参考リンク

- [YouTube Data API v3 公式ドキュメント](https://developers.google.com/youtube/v3)
- [Google Cloud Console](https://console.cloud.google.com/)
- [API クォータ管理](https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas)
