import type { DanmakuConfig } from './types';

const STORAGE_KEY = 'danmaku_config';

/** browser.storage に永続化するフィールド */
const PERSISTED_KEYS: (keyof DanmakuConfig)[] = [
  'enabled',
  'fontSize',
  'opacity',
  'speed',
  'autoFetch',
  'apiKey',
];

export const DEFAULT_CONFIG: DanmakuConfig = {
  enabled: true,
  fontSize: 28,
  opacity: 0.85,
  speed: 8,
  maxComments: 50,
  timeWindowSec: 2,
  autoFetch: false,
  apiKey: '',
};

export async function loadConfig(): Promise<DanmakuConfig> {
  const result = await browser.storage.local.get([STORAGE_KEY]);
  const saved = result[STORAGE_KEY] as Partial<DanmakuConfig> | undefined;
  return { ...DEFAULT_CONFIG, ...saved };
}

export function saveConfig(config: DanmakuConfig): void {
  const data: Partial<DanmakuConfig> = {};
  for (const key of PERSISTED_KEYS) {
    (data as Record<string, unknown>)[key] = config[key];
  }
  void browser.storage.local.set({ [STORAGE_KEY]: data });
}
