import AsyncStorage from '@react-native-async-storage/async-storage';

import { MatchState, RoundStats } from '../types/game';

const COMPLETED_MATCHES_STORAGE_KEY = 'stadium-tabu/completed-matches';
const MAX_STORED_MATCHES = 20;

export type CompletedMatchRecord = {
  id: string;
  createdAt: string;
  completedAt: string;
  totalRounds: number;
  winnerName: string | null;
  isDraw: boolean;
  teams: Array<{
    id: string;
    name: string;
    score: number;
  }>;
  totals: RoundStats;
};

export type MatchStatsSummary = {
  matchesPlayed: number;
  roundsPlayed: number;
  correctCount: number;
  passCount: number;
  tabuCount: number;
  totalActions: number;
  bestScore: number;
  averageActionsPerMatch: number;
};

export async function loadCompletedMatches() {
  const rawValue = await AsyncStorage.getItem(COMPLETED_MATCHES_STORAGE_KEY);

  if (!rawValue) {
    return [] as CompletedMatchRecord[];
  }

  return JSON.parse(rawValue) as CompletedMatchRecord[];
}

export async function saveCompletedMatch(match: MatchState) {
  const current = await loadCompletedMatches();

  if (current.some((entry) => entry.id === match.id)) {
    return current;
  }

  const next = [createCompletedMatchRecord(match), ...current].slice(0, MAX_STORED_MATCHES);
  await AsyncStorage.setItem(COMPLETED_MATCHES_STORAGE_KEY, JSON.stringify(next));

  return next;
}

export function buildMatchStatsSummary(matches: CompletedMatchRecord[]): MatchStatsSummary {
  const totals = matches.reduce(
    (accumulator, match) => {
      accumulator.matchesPlayed += 1;
      accumulator.roundsPlayed += match.totalRounds;
      accumulator.correctCount += match.totals.correctCount;
      accumulator.passCount += match.totals.passCount;
      accumulator.tabuCount += match.totals.tabuCount;
      accumulator.totalActions +=
        match.totals.correctCount + match.totals.passCount + match.totals.tabuCount;
      accumulator.bestScore = Math.max(
        accumulator.bestScore,
        ...match.teams.map((team) => team.score),
      );
      return accumulator;
    },
    {
      matchesPlayed: 0,
      roundsPlayed: 0,
      correctCount: 0,
      passCount: 0,
      tabuCount: 0,
      totalActions: 0,
      bestScore: 0,
    } satisfies Omit<MatchStatsSummary, 'averageActionsPerMatch'>,
  );

  return {
    ...totals,
    averageActionsPerMatch:
      totals.matchesPlayed > 0 ? Math.round(totals.totalActions / totals.matchesPlayed) : 0,
  };
}

function createCompletedMatchRecord(match: MatchState): CompletedMatchRecord {
  const allRounds = [
    ...match.history,
    {
      roundNumber: match.currentRound,
      teamId: match.teams[match.activeTeamIndex].id,
      stats: match.roundStats,
    },
  ];

  const totals = allRounds.reduce<RoundStats>(
    (accumulator, round) => ({
      correctCount: accumulator.correctCount + round.stats.correctCount,
      passCount: accumulator.passCount + round.stats.passCount,
      tabuCount: accumulator.tabuCount + round.stats.tabuCount,
      roundScoreDelta: accumulator.roundScoreDelta + round.stats.roundScoreDelta,
    }),
    {
      correctCount: 0,
      passCount: 0,
      tabuCount: 0,
      roundScoreDelta: 0,
    },
  );

  const sortedTeams = [...match.teams].sort((left, right) => right.score - left.score);
  const isDraw = sortedTeams[0]?.score === sortedTeams[1]?.score;

  return {
    id: match.id,
    createdAt: match.createdAt,
    completedAt: new Date().toISOString(),
    totalRounds: match.settings.totalRounds,
    winnerName: isDraw ? null : sortedTeams[0]?.name ?? null,
    isDraw,
    teams: match.teams.map((team) => ({
      id: team.id,
      name: team.name,
      score: team.score,
    })),
    totals,
  };
}
