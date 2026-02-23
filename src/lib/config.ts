import type { TelopConfig } from './types';

const STORAGE_KEY = 'telop_config';

/** browser.storage に永続化するフィールド */
const PERSISTED_KEYS: (keyof TelopConfig)[] = [
  'enabled',
  'fontSize',
  'opacity',
  'speed',
  'autoFetch',
  'apiKey',
];

export const DEFAULT_CONFIG: TelopConfig = {
  enabled: true,
  fontSize: 28,
  opacity: 0.85,
  speed: 8,
  maxComments: 50,
  timeWindowSec: 2,
  autoFetch: false,
  apiKey: '',
};

export async function loadConfig(): Promise<TelopConfig> {
  const result = await browser.storage.local.get([STORAGE_KEY]);
  const saved = result[STORAGE_KEY] as Partial<TelopConfig> | undefined;
  return { ...DEFAULT_CONFIG, ...saved };
}

export function saveConfig(config: TelopConfig): void {
  const data: Partial<TelopConfig> = {};
  for (const key of PERSISTED_KEYS) {
    (data as Record<string, unknown>)[key] = config[key];
  }
  void browser.storage.local.set({ [STORAGE_KEY]: data });
}
