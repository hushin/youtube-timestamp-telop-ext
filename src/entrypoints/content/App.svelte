<script lang="ts">
  import { danmakuState } from './state.svelte'
  import { saveConfig } from '../../lib/config'

  interface Props {
    onFetch: () => void
    onToggle: (enabled: boolean) => void
    onSeek: (time: number) => void
  }

  let { onFetch, onToggle, onSeek }: Props = $props()

  let settingsVisible = $state(false)
  let apiKeyInput = $state(danmakuState.config.apiKey)
  let showApiKey = $state(false)

  let listEl = $state<HTMLDivElement | null>(null)
  let userScrolledUntil = 0
  let programmaticScrollUntil = 0

  function handleUserScroll() {
    if (Date.now() < programmaticScrollUntil) return
    userScrolledUntil = Date.now() + 5000
  }

  // 現在再生中のコメントを特定
  let closestIndex = $derived.by(() => {
    let best = -1
    let bestDiff = Infinity
    for (let i = 0; i < danmakuState.comments.length; i++) {
      const diff = danmakuState.currentTime - danmakuState.comments[i].time
      if (diff >= 0 && diff < bestDiff && diff < 5) {
        bestDiff = diff
        best = i
      }
    }
    return best
  })

  $effect(() => {
    if (!listEl || closestIndex < 0) return
    if (Date.now() < userScrolledUntil) return
    const item = listEl.children[closestIndex] as HTMLElement | undefined
    if (!item) return
    programmaticScrollUntil = Date.now() + 600
    const itemRect = item.getBoundingClientRect()
    const containerRect = listEl.getBoundingClientRect()
    const targetTop =
      listEl.scrollTop + itemRect.top - containerRect.top - listEl.clientHeight / 2 + item.offsetHeight / 2
    listEl.scrollTo({ top: targetTop, behavior: 'smooth' })
  })

  function toggleDanmaku() {
    danmakuState.config.enabled = !danmakuState.config.enabled
    saveConfig(danmakuState.config)
    onToggle(danmakuState.config.enabled)
  }

  function toggleSettings() {
    settingsVisible = !settingsVisible
  }

  function saveApiKey() {
    danmakuState.config.apiKey = apiKeyInput.trim()
    saveConfig(danmakuState.config)
  }

  function handleFontSize(e: Event) {
    danmakuState.config.fontSize = parseInt((e.target as HTMLInputElement).value)
    saveConfig(danmakuState.config)
  }

  function handleOpacity(e: Event) {
    danmakuState.config.opacity =
      parseInt((e.target as HTMLInputElement).value) / 100
    saveConfig(danmakuState.config)
  }

  function handleSpeed(e: Event) {
    danmakuState.config.speed = parseInt((e.target as HTMLInputElement).value)
    saveConfig(danmakuState.config)
  }

  function handleAutoFetch(e: Event) {
    danmakuState.config.autoFetch = (e.target as HTMLInputElement).checked
    saveConfig(danmakuState.config)
  }
</script>

<div id="danmaku-panel">
  <div class="danmaku-panel-header">
    <div class="dp-left">
      <span class="dp-title">弾幕コメント</span>
      <span
        class="dp-badge"
        class:has-comments={danmakuState.comments.length > 0}
      >
        {danmakuState.comments.length}件
      </span>
    </div>
    <div class="dp-right">
      <button
        class="dp-btn primary"
        disabled={danmakuState.isLoading}
        onclick={onFetch}
      >
        コメント取得
      </button>
      <button
        class="dp-btn"
        class:active={danmakuState.config.enabled}
        onclick={toggleDanmaku}
      >
        弾幕 {danmakuState.config.enabled ? 'ON' : 'OFF'}
      </button>
      <button class="dp-btn" onclick={toggleSettings}>設定</button>
    </div>
  </div>

  <div class="danmaku-settings-row" class:visible={settingsVisible}>
    <label class="api-key-group">
      API Key
      <input
        type={showApiKey ? 'text' : 'password'}
        placeholder="YouTube Data API v3 キーを入力"
        bind:value={apiKeyInput}
        spellcheck="false"
        autocomplete="off"
      />
      <button class="dp-btn" onclick={() => (showApiKey = !showApiKey)}>
        {showApiKey ? '隠す' : '表示'}
      </button>
      <button class="dp-btn" onclick={saveApiKey}>保存</button>
    </label>
    <label>
      文字サイズ
      <input
        type="range"
        min="16"
        max="48"
        value={danmakuState.config.fontSize}
        oninput={handleFontSize}
      />
      <span class="setting-val">{danmakuState.config.fontSize}</span>
    </label>
    <label>
      透明度
      <input
        type="range"
        min="20"
        max="100"
        value={Math.round(danmakuState.config.opacity * 100)}
        oninput={handleOpacity}
      />
      <span class="setting-val"
        >{Math.round(danmakuState.config.opacity * 100)}%</span
      >
    </label>
    <label>
      速度
      <input
        type="range"
        min="3"
        max="15"
        value={danmakuState.config.speed}
        oninput={handleSpeed}
      />
      <span class="setting-val">{danmakuState.config.speed}s</span>
    </label>
    <label class="checkbox-label">
      <input
        type="checkbox"
        checked={danmakuState.config.autoFetch}
        onchange={handleAutoFetch}
      />
      ページ読込時に自動取得
    </label>
  </div>

  <div class="danmaku-status-bar" class:visible={danmakuState.statusVisible}>
    {#if danmakuState.statusType === 'loading'}
      <span class="spinner"></span> {danmakuState.statusMessage}
    {:else if danmakuState.statusType === 'error'}
      <span class="status-error">{danmakuState.statusMessage}</span>
    {:else}
      {danmakuState.statusMessage}
    {/if}
  </div>

  <div class="danmaku-comment-list" bind:this={listEl} onscroll={handleUserScroll}>
    {#if danmakuState.comments.length === 0}
      <div class="empty-state">
        <div class="empty-state-icon">💬</div>
        「コメント取得」ボタンを押すと<br />タイムスタンプ付きコメントを読み込みます
      </div>
    {:else}
      {#each danmakuState.comments as comment, i}
        <div
          class="danmaku-list-item"
          class:now-playing={i === closestIndex}
          onclick={() => onSeek(comment.time)}
          role="button"
          tabindex="0"
          onkeydown={(e) => {
            if (e.key === 'Enter') onSeek(comment.time)
          }}
        >
          <span class="dl-time">{comment.timeStr}</span>
          <div class="dl-text">{comment.fullText}</div>
        </div>
      {/each}
    {/if}
  </div>
</div>
