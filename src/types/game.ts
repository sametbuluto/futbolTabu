export type CardCategory = 'player' | 'club' | 'manager' | 'stadium' | 'term' | 'national_team';

export type CardDifficulty = 'easy' | 'medium' | 'hard';

export type GameEventAction = 'correct' | 'pass' | 'tabu';

export type Card = {
  id: string;
  term: string;
  forbiddenWords: string[];
  category: CardCategory;
  difficulty: CardDifficulty;
  language: 'tr';
  isActive: boolean;
};

export type Team = {
  id: string;
  name: string;
  score: number;
};

export type GameSettings = {
  roundDurationSeconds: number;
  totalRounds: number;
  correctScore: number;
  passScore: number;
  tabuPenalty: number;
  passLimitEnabled: boolean;
  passLimitPerRound: number | null;
};

export type RoundStats = {
  correctCount: number;
  passCount: number;
  tabuCount: number;
  roundScoreDelta: number;
};

export type RoundSummary = {
  roundNumber: number;
  teamId: string;
  stats: RoundStats;
};

export type GameEventLogItem = {
  id: string;
  roundNumber: number;
  teamId: string;
  cardId: string;
  cardTerm: string;
  cardCategory: CardCategory;
  action: GameEventAction;
  timestamp: string;
};

export type MatchState = {
  id: string;
  teams: Team[];
  settings: GameSettings;
  currentRound: number;
  activeTeamIndex: number;
  remainingSeconds: number;
  deck: Card[];
  currentCardIndex: number;
  roundStats: RoundStats;
  history: RoundSummary[];
  eventLog: GameEventLogItem[];
  createdAt: string;
  lastUpdatedAt: string;
};

export type CreateMatchInput = {
  teamNames: string[];
  settings: GameSettings;
  cards: Card[];
};
