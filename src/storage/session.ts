import AsyncStorage from '@react-native-async-storage/async-storage';

import { MatchState } from '../types/game';

export const ACTIVE_MATCH_STORAGE_KEY = 'stadium-tabu/active-match';

export type PersistedMatchSession = {
  match: MatchState;
  screen: 'countdown' | 'game' | 'summary';
  countdown: number;
  setup: {
    teamOne: string;
    teamTwo: string;
    roundDurationSeconds: number;
    totalRounds: number;
    passLimitEnabled: boolean;
    passLimitPerRound: number;
  };
  savedAt: string;
};

export async function saveActiveMatchSession(session: PersistedMatchSession) {
  await AsyncStorage.setItem(ACTIVE_MATCH_STORAGE_KEY, JSON.stringify(session));
}

export async function loadActiveMatchSession() {
  const rawValue = await AsyncStorage.getItem(ACTIVE_MATCH_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  return JSON.parse(rawValue) as PersistedMatchSession;
}

export async function clearActiveMatchSession() {
  await AsyncStorage.removeItem(ACTIVE_MATCH_STORAGE_KEY);
}
