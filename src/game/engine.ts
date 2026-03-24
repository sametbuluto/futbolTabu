import {
  Card,
  CreateMatchInput,
  GameEventAction,
  GameEventLogItem,
  GameSettings,
  MatchState,
  RoundStats,
  Team,
} from '../types/game';

export const defaultSettings: GameSettings = {
  roundDurationSeconds: 60,
  totalRounds: 6,
  correctScore: 1,
  passScore: 0,
  tabuPenalty: -1,
  passLimitEnabled: false,
  passLimitPerRound: null,
};

export function createMatch({ cards, settings, teamNames }: CreateMatchInput): MatchState {
  const activeCards = balanceDeck(shuffle(cards.filter((card) => card.isActive)));
  const teams: Team[] = teamNames.map((name, index) => ({
    id: `team-${index + 1}`,
    name,
    score: 0,
  }));

  return {
    teams,
    settings,
    currentRound: 1,
    activeTeamIndex: 0,
    remainingSeconds: settings.roundDurationSeconds,
    deck: activeCards,
    currentCardIndex: 0,
    roundStats: createEmptyRoundStats(),
    history: [],
    eventLog: [],
    lastUpdatedAt: new Date().toISOString(),
  };
}

export function getCurrentCard(match: MatchState): Card {
  return match.deck[match.currentCardIndex % match.deck.length];
}

export function tick(match: MatchState): MatchState {
  return {
    ...match,
    remainingSeconds: Math.max(0, match.remainingSeconds - 1),
    lastUpdatedAt: new Date().toISOString(),
  };
}

export function canUsePass(match: MatchState): boolean {
  if (!match.settings.passLimitEnabled) {
    return true;
  }

  if (match.settings.passLimitPerRound == null) {
    return true;
  }

  return match.roundStats.passCount < match.settings.passLimitPerRound;
}

export function markCorrect(match: MatchState): MatchState {
  return applyCardAction(match, {
    action: 'correct',
    scoreDelta: match.settings.correctScore,
    statKey: 'correctCount',
  });
}

export function markPass(match: MatchState): MatchState {
  if (!canUsePass(match)) {
    return match;
  }

  return applyCardAction(match, {
    action: 'pass',
    scoreDelta: match.settings.passScore,
    statKey: 'passCount',
  });
}

export function markTabu(match: MatchState): MatchState {
  return applyCardAction(match, {
    action: 'tabu',
    scoreDelta: match.settings.tabuPenalty,
    statKey: 'tabuCount',
  });
}

export function startNextRound(match: MatchState): MatchState {
  return {
    ...match,
    currentRound: match.currentRound + 1,
    activeTeamIndex: (match.activeTeamIndex + 1) % match.teams.length,
    remainingSeconds: match.settings.roundDurationSeconds,
    roundStats: createEmptyRoundStats(),
    history: [
      ...match.history,
      {
        roundNumber: match.currentRound,
        teamId: match.teams[match.activeTeamIndex].id,
        stats: { ...match.roundStats },
      },
    ],
    lastUpdatedAt: new Date().toISOString(),
  };
}

function applyCardAction(
  match: MatchState,
  input: {
    action: GameEventAction;
    scoreDelta: number;
    statKey: keyof Pick<RoundStats, 'correctCount' | 'passCount' | 'tabuCount'>;
  },
): MatchState {
  const activeTeam = match.teams[match.activeTeamIndex];
  const currentCard = getCurrentCard(match);
  const teams = match.teams.map((team, index) =>
    index === match.activeTeamIndex
      ? { ...team, score: team.score + input.scoreDelta }
      : team,
  );

  return {
    ...match,
    teams,
    currentCardIndex: getNextCardIndex(match),
    roundStats: {
      ...match.roundStats,
      [input.statKey]: match.roundStats[input.statKey] + 1,
      roundScoreDelta: match.roundStats.roundScoreDelta + input.scoreDelta,
    },
    eventLog: [
      ...match.eventLog,
      createEventLogItem({
        action: input.action,
        card: currentCard,
        roundNumber: match.currentRound,
        teamId: activeTeam.id,
      }),
    ],
    lastUpdatedAt: new Date().toISOString(),
  };
}

function getNextCardIndex(match: MatchState) {
  return (match.currentCardIndex + 1) % match.deck.length;
}

function createEmptyRoundStats(): RoundStats {
  return {
    correctCount: 0,
    passCount: 0,
    tabuCount: 0,
    roundScoreDelta: 0,
  };
}

function createEventLogItem(input: {
  action: GameEventAction;
  card: Card;
  roundNumber: number;
  teamId: string;
}): GameEventLogItem {
  return {
    id: `${input.teamId}-${input.roundNumber}-${input.card.id}-${Date.now()}`,
    roundNumber: input.roundNumber,
    teamId: input.teamId,
    cardId: input.card.id,
    cardTerm: input.card.term,
    cardCategory: input.card.category,
    action: input.action,
    timestamp: new Date().toISOString(),
  };
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const temp = next[index];
    next[index] = next[swapIndex];
    next[swapIndex] = temp;
  }

  return next;
}

function balanceDeck(cards: Card[]): Card[] {
  if (cards.length < 3) {
    return cards;
  }

  const pool = [...cards];
  const result: Card[] = [];

  while (pool.length > 0) {
    const previous = result[result.length - 1];
    const nextIndex = pool.findIndex((card) => card.category !== previous?.category);
    result.push(pool.splice(nextIndex >= 0 ? nextIndex : 0, 1)[0]);
  }

  return result;
}
