import type { TimestampComment, TelopConfig, StatusType } from '../../lib/types';
import { DEFAULT_CONFIG } from '../../lib/config';

class TelopState {
  config: TelopConfig = $state({ ...DEFAULT_CONFIG });
  comments: TimestampComment[] = $state([]);
  statusMessage: string = $state('');
  statusType: StatusType = $state('info');
  statusVisible: boolean = $state(false);
  isLoading: boolean = $state(false);
  currentTime: number = $state(0);
}

export const telopState = new TelopState();
