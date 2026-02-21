<script lang="ts">
  import type { DanmakuConfig } from '../../lib/types'

  let apiKeySet = $state(false)

  $effect(() => {
    browser.storage.local.get(['danmaku_config']).then((result) => {
      const cfg = (result.danmaku_config ?? {}) as Partial<DanmakuConfig>
      apiKeySet = !!cfg.apiKey
    })
  })
</script>

<h1>YouTube Danmaku Player</h1>
<p class="subtitle">ニコニコ風弾幕コメント v2.1</p>

<div class="api-status" class:ok={apiKeySet} class:missing={!apiKeySet}>
  <span class="dot" class:green={apiKeySet} class:yellow={!apiKeySet}></span>
  <span>{apiKeySet ? 'API Key 設定済み' : 'API Key 未設定'}</span>
</div>

<div class="section">
  <div class="section-title">使い方</div>
  <ul>
    <li>動画ページ下の「コメント取得」ボタンで開始</li>
    <li>YouTube Data API v3 でコメントを取得</li>
    <li>タイムスタンプ付きコメントを弾幕で表示</li>
    <li>コメント一覧クリックでその時間にジャンプ</li>
    <li>設定でAPI Key入力・各種調整</li>
  </ul>
</div>

<div class="section">
  <div class="section-title">API Key 設定</div>
  <ul>
    <li>動画ページの設定ボタンからAPI Keyを入力</li>
    <li>YouTube Data API v3 のキーが必要です</li>
  </ul>
</div>

<div class="footer">v2.1.0 — YouTube Danmaku Player Extension</div>

<style>
  h1 {
    font-size: 16px;
    margin-bottom: 4px;
    color: #fff;
  }

  .subtitle {
    font-size: 11px;
    color: #888;
    margin-bottom: 16px;
  }

  .section {
    margin-bottom: 14px;
  }

  .section-title {
    font-size: 12px;
    font-weight: bold;
    color: #aaa;
    margin-bottom: 6px;
    border-bottom: 1px solid #333;
    padding-bottom: 4px;
  }

  ul {
    padding-left: 16px;
    font-size: 12px;
    color: #999;
    line-height: 1.8;
  }

  .api-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 6px;
    margin-bottom: 12px;
    font-size: 12px;
  }

  .api-status.ok {
    background: #1b3a2d;
    color: #4ade80;
  }

  .api-status.missing {
    background: #3a2d1b;
    color: #f59e0b;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .dot.green {
    background: #4ade80;
  }

  .dot.yellow {
    background: #f59e0b;
  }

  .footer {
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px solid #333;
    font-size: 10px;
    color: #666;
    text-align: center;
  }
</style>
