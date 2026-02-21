import type { DanmakuComment } from './types';

const TIMESTAMP_RE = /(\d{1,2}:\d{2}(?::\d{2})?)/g;

/**
 * "1:23" / "01:23" / "1:23:45" → 秒数に変換
 */
function parseTimestamp(str: string): number | null {
  const match = str.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return null;

  if (match[3] !== undefined) {
    return parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]);
  }
  return parseInt(match[1]) * 60 + parseInt(match[2]);
}

/**
 * 秒数 → 表示用文字列
 */
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * コメント文字列からタイムスタンプ付きコメントを抽出（最初の1件のみ）
 */
export function extractTimestampedComments(commentText: string, author: string): DanmakuComment[] {
  const results: DanmakuComment[] = [];
  let match: RegExpExecArray | null;

  // lastIndex をリセット
  TIMESTAMP_RE.lastIndex = 0;

  while ((match = TIMESTAMP_RE.exec(commentText)) !== null) {
    const time = parseTimestamp(match[1]);
    if (time === null || time < 0) continue;

    let text = commentText.replace(TIMESTAMP_RE, '').trim();
    if (!text) text = commentText;
    if (text.length > 60) text = text.substring(0, 57) + '...';

    results.push({ time, text, author, timeStr: formatTime(time) });
    break; // 最初のタイムスタンプのみ
  }

  return results;
}

/**
 * コメント配列をソート＋重複除去
 */
export function deduplicateComments(comments: DanmakuComment[]): DanmakuComment[] {
  comments.sort((a, b) => a.time - b.time);

  const seen = new Set<string>();
  return comments.filter((c) => {
    const key = `${c.time}:${c.text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
