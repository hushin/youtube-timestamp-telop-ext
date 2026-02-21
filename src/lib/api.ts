import type { DanmakuComment, YouTubeCommentThreadsResponse, YouTubeAPIError } from './types';
import { extractTimestampedComments } from './parser';

const API_BASE = 'https://www.googleapis.com/youtube/v3/commentThreads';
const MAX_PAGES = 30;
const PER_PAGE = 100;

export class APIError extends Error {
  constructor(
    public readonly code: string,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'APIError';
  }
}

export const API_ERROR_MESSAGES: Record<string, string> = {
  API_KEY_MISSING: 'API キーが設定されていません。設定から入力してください。',
  API_BAD_KEY: 'API キーが無効です。正しいキーを入力してください。',
  API_FORBIDDEN: 'APIアクセスが拒否されました。キーの権限を確認してください。',
  COMMENTS_DISABLED: 'この動画はコメントが無効になっています。',
};

/**
 * YouTube Data API v3 でタイムスタンプ付きコメントを取得
 */
export async function fetchComments(
  videoId: string,
  apiKey: string,
  onProgress?: (found: number, pages: number) => void,
): Promise<DanmakuComment[]> {
  if (!apiKey) {
    throw new APIError('API_KEY_MISSING');
  }

  const allComments: DanmakuComment[] = [];
  let pageToken = '';
  let pages = 0;

  do {
    const url = new URL(API_BASE);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('videoId', videoId);
    url.searchParams.set('maxResults', String(PER_PAGE));
    url.searchParams.set('textFormat', 'plainText');
    url.searchParams.set('order', 'relevance');
    url.searchParams.set('key', apiKey);
    if (pageToken) {
      url.searchParams.set('pageToken', pageToken);
    }

    const resp = await fetch(url.toString());

    if (!resp.ok) {
      const errorData: YouTubeAPIError = await resp.json().catch(() => ({}));
      const reason = errorData?.error?.errors?.[0]?.reason ?? String(resp.status);

      if (resp.status === 403) {
        throw new APIError(reason === 'commentsDisabled' ? 'COMMENTS_DISABLED' : 'API_FORBIDDEN');
      }
      if (resp.status === 400) {
        throw new APIError('API_BAD_KEY');
      }
      throw new APIError(`API_ERROR_${resp.status}`);
    }

    const data: YouTubeCommentThreadsResponse = await resp.json();

    for (const item of data.items ?? []) {
      const snippet = item.snippet?.topLevelComment?.snippet;
      if (!snippet) continue;

      const text = snippet.textOriginal ?? snippet.textDisplay ?? '';
      const author = snippet.authorDisplayName ?? '';
      const timestamped = extractTimestampedComments(text, author);
      allComments.push(...timestamped);
    }

    pageToken = data.nextPageToken ?? '';
    pages++;

    onProgress?.(allComments.length, pages);
  } while (pageToken && pages < MAX_PAGES);

  return allComments;
}
