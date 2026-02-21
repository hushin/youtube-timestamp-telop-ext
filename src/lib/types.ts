/** タイムスタンプ付きコメント */
export interface DanmakuComment {
  /** 動画内の時刻（秒） */
  time: number;
  /** 弾幕として表示するテキスト（60文字以内に省略済み） */
  text: string;
  /** リスト表示用の省略前テキスト */
  fullText: string;
  /** コメント投稿者名 */
  author: string;
  /** フォーマット済み時刻文字列（例: "1:23"） */
  timeStr: string;
}

/** 画面上をアニメーション中の弾幕 */
export interface ActiveDanmaku {
  el: HTMLDivElement;
  startTime: number;
  totalDistance: number;
  travelDuration: number;
  containerWidth: number;
}

/** 永続化される設定 */
export interface DanmakuConfig {
  enabled: boolean;
  fontSize: number;
  opacity: number;
  speed: number;
  maxComments: number;
  timeWindowSec: number;
  autoFetch: boolean;
  apiKey: string;
}

/** ステータスバーの表示タイプ */
export type StatusType = 'info' | 'loading' | 'error';

/** YouTube Data API commentThreads レスポンス */
export interface YouTubeCommentThreadsResponse {
  items?: YouTubeCommentThread[];
  nextPageToken?: string;
}

export interface YouTubeCommentThread {
  snippet?: {
    topLevelComment?: {
      snippet?: {
        textOriginal?: string;
        textDisplay?: string;
        authorDisplayName?: string;
      };
    };
  };
}

export interface YouTubeAPIError {
  error?: {
    errors?: Array<{ reason?: string }>;
  };
}
