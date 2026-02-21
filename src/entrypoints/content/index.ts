import { mount, unmount } from 'svelte';
import type { DanmakuComment } from '../../lib/types';
import { loadConfig } from '../../lib/config';
import { deduplicateComments } from '../../lib/parser';
import { fetchComments, APIError, API_ERROR_MESSAGES } from '../../lib/api';
import { DanmakuRenderer } from '../../lib/renderer';
import { danmakuState } from './state.svelte';
import App from './App.svelte';
import './style.css';

export default defineContentScript({
  matches: ['*://www.youtube.com/watch*'],
  runAt: 'document_idle',

  main() {
    const state = danmakuState;

    let videoEl: HTMLVideoElement | null = null;
    let firedSet = new Set<number>();
    let lastVideoTime = -1;
    let initialized = false;
    let renderer: DanmakuRenderer | null = null;
    let panelComponent: Record<string, unknown> | null = null;
    let panelHost: HTMLDivElement | null = null;
    let syncIntervalId: ReturnType<typeof setInterval> | null = null;

    function getVideoId(): string {
      return new URLSearchParams(window.location.search).get('v') ?? '';
    }

    function clearAll(): void {
      renderer?.clear();
      firedSet.clear();
      lastVideoTime = -1;
    }

    function showStatus(message: string, type: 'info' | 'loading' | 'error' = 'info'): void {
      state.statusMessage = message;
      state.statusType = type;
      state.statusVisible = true;
    }

    function hideStatus(): void {
      state.statusVisible = false;
    }

    // --- Fetch ---

    async function fetchAndLoad(): Promise<void> {
      if (state.isLoading) return;

      const videoId = getVideoId();
      if (!videoId) {
        showStatus('動画IDが取得できません', 'error');
        return;
      }

      if (!state.config.apiKey) {
        showStatus('設定からYouTube Data API キーを入力してください', 'error');
        return;
      }

      state.isLoading = true;
      clearAll();
      showStatus('コメント取得中...', 'loading');

      try {
        const raw = await fetchComments(videoId, state.config.apiKey, (found, pages) => {
          showStatus(`コメント取得中... (${found}件検出 / ${pages}ページ)`, 'loading');
        });

        state.comments = deduplicateComments(raw);

        if (state.comments.length > 0) {
          showStatus(
            `${state.comments.length}件のタイムスタンプ付きコメントを検出しました`,
            'info',
          );
        } else {
          showStatus('タイムスタンプ付きコメントが見つかりませんでした', 'info');
        }
        setTimeout(hideStatus, 4000);

        console.log(
          `[YouTube Danmaku Player] ${state.comments.length}件検出 (videoId: ${videoId})`,
        );
      } catch (err) {
        console.error('[YouTube Danmaku Player] Error:', err);

        const code = err instanceof APIError ? err.code : String(err);
        const msg = API_ERROR_MESSAGES[code] ?? `コメント取得エラー: ${code}`;
        showStatus(msg, 'error');
      } finally {
        state.isLoading = false;
      }
    }

    // --- Video sync ---

    function syncWithVideo(): void {
      if (!videoEl || !state.config.enabled) return;

      const time = videoEl.currentTime;
      state.currentTime = time;

      // シーク検出（3秒以上ジャンプ）
      if (Math.abs(time - lastVideoTime) > 3) {
        clearAll();
      }
      lastVideoTime = time;

      // 一時停止中は発射しない
      if (videoEl.paused) return;

      // 弾幕発射
      state.comments.forEach((comment: DanmakuComment, index: number) => {
        if (firedSet.has(index)) return;
        const diff = time - comment.time;
        if (diff >= 0 && diff < state.config.timeWindowSec) {
          firedSet.add(index);
          renderer?.fire(comment);
        }
      });
    }

    // --- Init ---

    function destroyPanel(): void {
      if (panelComponent) {
        void unmount(panelComponent);
        panelComponent = null;
      }
      if (panelHost) {
        panelHost.remove();
        panelHost = null;
      }
      document.getElementById('danmaku-container')?.remove();
    }

    async function init(): Promise<void> {
      if (initialized) return;

      const loaded = await loadConfig();
      Object.assign(state.config, loaded);

      const video = document.querySelector<HTMLVideoElement>('video.html5-main-video, video');
      if (!video) {
        setTimeout(init, 3000);
        return;
      }
      videoEl = video;

      // 弾幕コンテナ（プレーヤー内）
      const player = document.querySelector<HTMLElement>('#movie_player, .html5-video-player');
      if (!player) {
        setTimeout(init, 3000);
        return;
      }

      document.getElementById('danmaku-container')?.remove();
      const danmakuContainer = document.createElement('div');
      danmakuContainer.id = 'danmaku-container';
      player.appendChild(danmakuContainer);

      // パネルUI（プレーヤー下）
      destroyPanel();
      panelHost = document.createElement('div');

      const belowPlayer = document.querySelector('#below, ytd-watch-metadata');
      if (belowPlayer?.parentNode) {
        belowPlayer.parentNode.insertBefore(panelHost, belowPlayer);
      } else {
        player.parentNode?.insertBefore(panelHost, player.nextSibling);
      }

      panelComponent = mount(App, {
        target: panelHost,
        props: {
          onFetch: fetchAndLoad,
          onToggle: (enabled: boolean) => {
            if (!enabled) clearAll();
          },
          onSeek: (time: number) => {
            if (videoEl) {
              videoEl.currentTime = time;
              if (videoEl.paused) {
                videoEl.play().catch(() => {});
              }
            }
          },
        },
      });

      // Renderer
      renderer = new DanmakuRenderer(state.config);
      renderer.attach(danmakuContainer, video);
      renderer.start();

      initialized = true;

      // 同期タイマー（200msごと）
      if (syncIntervalId) clearInterval(syncIntervalId);
      syncIntervalId = setInterval(syncWithVideo, 200);

      // シーク
      video.addEventListener('seeked', () => clearAll());

      // 自動取得
      if (state.config.autoFetch && state.config.apiKey) {
        setTimeout(fetchAndLoad, 2000);
      }

      console.log('[YouTube Danmaku Player] v2.1 初期化完了');
    }

    // --- YouTube SPA navigation ---

    let currentUrl = location.href;

    function checkUrlChange(): void {
      if (location.href !== currentUrl) {
        currentUrl = location.href;
        if (location.href.includes('/watch')) {
          clearAll();
          state.comments = [];
          firedSet = new Set();
          initialized = false;
          renderer?.stop();
          if (syncIntervalId) clearInterval(syncIntervalId);
          destroyPanel();
          setTimeout(init, 2000);
        }
      }
    }

    setInterval(checkUrlChange, 1000);

    // --- Boot ---
    setTimeout(init, 2000);
  },
});
