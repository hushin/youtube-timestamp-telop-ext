import type { DanmakuComment, DanmakuConfig, StatusType } from '../../lib/types';
import { DEFAULT_CONFIG } from '../../lib/config';

class DanmakuState {
  config: DanmakuConfig = $state({ ...DEFAULT_CONFIG });
  comments: DanmakuComment[] = $state([]);
  statusMessage: string = $state('');
  statusType: StatusType = $state('info');
  statusVisible: boolean = $state(false);
  isLoading: boolean = $state(false);
  currentTime: number = $state(0);
}

export const danmakuState = new DanmakuState();
