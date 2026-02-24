# Privacy Policy / プライバシーポリシー

**YouTube Timestamp Telop**
Last updated: 2026-02-24

---

## 日本語

### 収集するデータ

本拡張機能が保存するデータは以下の通りです。

| データ | 保存場所 | 用途 |
|---|---|---|
| YouTube Data API キー（ユーザーが入力） | ブラウザのローカルストレージ（`browser.storage.local`） | YouTube API へのリクエスト認証 |
| 表示設定（フォントサイズ・速度・透明度など） | ブラウザのローカルストレージ | ユーザー設定の保持 |

### 収集しないデータ

- 視聴履歴・検索履歴などの閲覧行動
- 個人識別情報（氏名・メールアドレス等）
- 位置情報
- その他いかなる個人情報

### データの送信先

本拡張機能が外部と通信する先は **Google の YouTube Data API v3 のみ** です（`www.googleapis.com`）。
API キーを含むリクエストはユーザーのブラウザから直接 Google へ送信されます。
開発者（拡張機能作者）のサーバーへのデータ送信は一切行いません。

### データの削除

保存されたデータ（API キー・表示設定）は、拡張機能のアンインストールまたは設定画面のリセット機能で削除できます。
データはユーザーのブラウザ内にのみ存在し、外部サーバーには保存されません。

### データの第三者提供

収集したデータを第三者に販売・提供・共有することはありません。

### Google API の利用規約への準拠

Google API から取得した情報の使用は、[Chrome Web Store ユーザーデータポリシー](https://developer.chrome.com/docs/webstore/program-policies/data-handling/)（Limited Use 要件を含む）に準拠します。

### リモートコード

本拡張機能はリモートから動的にコードを読み込む機能を使用していません。

### お問い合わせ

ご質問は [GitHub Issues](https://github.com/hushin/youtube-timestamp-telop-ext/issues) にてお受けします。

---

## English

### Data We Collect

| Data | Storage | Purpose |
|---|---|---|
| YouTube Data API key (user-provided) | Browser local storage (`browser.storage.local`) | Authenticating requests to YouTube API |
| Display settings (font size, speed, opacity, etc.) | Browser local storage | Persisting user preferences |

### Data We Do NOT Collect

- Browsing history or watch history
- Personally identifiable information (name, email, etc.)
- Location data
- Any other personal information

### External Communication

This extension communicates **only with Google's YouTube Data API v3** (`www.googleapis.com`).
Requests including the API key are sent directly from the user's browser to Google.
No data is sent to the developer's servers.

### Data Deletion

Stored data (API key and display settings) can be deleted by uninstalling the extension or using the reset function in the settings screen.
All data exists solely within the user's browser and is never stored on external servers.

### Third-Party Sharing

We do not sell, share, or provide collected data to any third party.

### Google API Services User Data Policy

The use of information received from Google APIs will adhere to the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/data-handling/), including the Limited Use requirements.

### Remote Code

This extension does not load or execute any remotely hosted code.

### Contact

For questions, please open an issue at [GitHub Issues](https://github.com/hushin/youtube-timestamp-telop-ext/issues).
