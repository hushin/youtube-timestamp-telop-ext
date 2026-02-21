import type { ActiveDanmaku, DanmakuComment, DanmakuConfig } from './types';

const FRAME_INTERVAL = 1000 / 24; // 24fps ≈ 41.67ms

export class DanmakuRenderer {
  private container: HTMLDivElement | null = null;
  private activeComments: ActiveDanmaku[] = [];
  private lanes: number[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private videoEl: HTMLVideoElement | null = null;
  private config: DanmakuConfig;

  constructor(config: DanmakuConfig) {
    this.config = config;
  }

  attach(container: HTMLDivElement, videoEl: HTMLVideoElement): void {
    this.container = container;
    this.videoEl = videoEl;
  }

  /** 24fps アニメーションループを開始 */
  start(): void {
    this.stop();

    this.intervalId = setInterval(() => {
      this.tick();
    }, FRAME_INTERVAL);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /** 弾幕を1つ発射 */
  fire(comment: DanmakuComment): void {
    if (!this.container || !this.config.enabled) return;
    if (this.activeComments.length >= this.config.maxComments) return;

    const el = document.createElement('div');
    el.className = 'danmaku-comment';
    el.textContent = comment.text;
    const fontSize = this.getActualFontSize();
    el.style.fontSize = `${fontSize}px`;
    el.style.opacity = String(this.config.opacity);
    el.style.color = '#fff';
    el.style.visibility = 'hidden';

    this.container.appendChild(el);

    const textWidth = el.offsetWidth;
    const containerWidth = this.container.offsetWidth;

    const lane = this.getAvailableLane();
    const lineHeight = fontSize * 1.4;
    el.style.top = `${this.getLaneY(lane, lineHeight)}px`;
    el.style.left = `${containerWidth}px`;
    el.style.visibility = '';

    const travelDuration = this.config.speed * 1000;
    const textPassTime = (textWidth / (containerWidth + textWidth)) * travelDuration;
    this.lanes[lane] = performance.now() + textPassTime + 200;

    this.activeComments.push({
      el,
      startTime: performance.now(),
      totalDistance: containerWidth + textWidth,
      travelDuration,
      containerWidth,
    });
  }

  /** 全弾幕をクリア */
  clear(): void {
    for (const c of this.activeComments) {
      c.el.remove();
    }
    this.activeComments = [];
  }

  /** アクティブな弾幕数 */
  get activeCount(): number {
    return this.activeComments.length;
  }

  // --- private ---

  private tick(): void {
    // 動画が一時停止中 → 弾幕も一時停止
    if (this.videoEl?.paused) {
      const now = performance.now();
      for (const c of this.activeComments) {
        c.startTime += FRAME_INTERVAL;
      }
      for (let i = 0; i < this.lanes.length; i++) {
        if (this.lanes[i] > now) {
          this.lanes[i] += FRAME_INTERVAL;
        }
      }
      return;
    }

    const now = performance.now();

    for (let i = this.activeComments.length - 1; i >= 0; i--) {
      const c = this.activeComments[i];
      const progress = (now - c.startTime) / c.travelDuration;

      if (progress >= 1) {
        c.el.remove();
        this.activeComments.splice(i, 1);
      } else {
        const x = c.containerWidth - progress * c.totalDistance;
        c.el.style.left = `${x}px`;
      }
    }
  }

  /** コンテナ幅に応じてfontSizeをスケール */
  private getActualFontSize(): number {
    const containerWidth = this.container?.offsetWidth ?? 720;
    return (this.config.fontSize / 720) * containerWidth;
  }

  /**
   * レーンインデックスからy座標(px)を計算する。
   * - 1周目(index < numLanesFirst): 範囲内の通常位置
   * - 2周目(index >= numLanesFirst): コンテナ全体を使い、lineHeight/2 ずらす
   */
  private getLaneY(laneIndex: number, lineHeight: number): number {
    const containerHeight = this.container?.offsetHeight ?? 600;
    const numLanesFirst = Math.max(1, Math.floor(containerHeight / lineHeight));
    if (laneIndex < numLanesFirst) {
      return laneIndex * lineHeight;
    }
    const secondIndex = laneIndex - numLanesFirst;
    return secondIndex * lineHeight + lineHeight / 2;
  }

  private getAvailableLane(): number {
    const containerHeight = this.container?.offsetHeight ?? 600;
    const lineHeight = this.getActualFontSize() * 1.4;

    // 1周目: 制限されたレーン数
    const numLanesFirst = Math.max(1, Math.floor(containerHeight / lineHeight));
    // 2周目: コンテナ全体を使ったレーン（半分ずれ）
    const numLanesSecond = Math.max(1, Math.floor(containerHeight / lineHeight));
    const totalLanes = numLanesFirst + numLanesSecond;

    if (this.lanes.length !== totalLanes) {
      this.lanes = Array.from({ length: totalLanes }, () => 0);
    }

    const now = performance.now();

    // 1周目の空きレーンを優先
    for (let i = 0; i < numLanesFirst; i++) {
      if (this.lanes[i] <= now) return i;
    }

    // 1周目が全て埋まっていたら2周目の空きレーンを使う
    for (let i = numLanesFirst; i < totalLanes; i++) {
      if (this.lanes[i] <= now) return i;
    }

    // 全レーン埋まっていたら最も早く空くレーン
    let bestLane = 0;
    let bestTime = Infinity;
    for (let i = 0; i < totalLanes; i++) {
      if (this.lanes[i] < bestTime) {
        bestTime = this.lanes[i];
        bestLane = i;
      }
    }

    return bestLane;
  }
}
