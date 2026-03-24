const test = require('node:test');
const assert = require('node:assert/strict');

const {
  canUsePass,
  createMatch,
  defaultSettings,
  getCurrentCard,
  markCorrect,
  markPass,
  markTabu,
  startNextRound,
  tick,
} = require('../.tmp-test/src/game/engine.js');

const SAMPLE_TEST_CARDS = [
  {
    id: 'card-1',
    term: 'Lionel Messi',
    forbiddenWords: ['Arjantin', 'Barcelona', '10', 'Forvet', 'Inter Miami'],
    category: 'player',
    difficulty: 'easy',
    language: 'tr',
    isActive: true,
  },
  {
    id: 'card-2',
    term: 'Ofsayt',
    forbiddenWords: ['Hakem', 'Cizgi', 'Bayrak', 'Forvet', 'Pozisyon'],
    category: 'term',
    difficulty: 'easy',
    language: 'tr',
    isActive: true,
  },
  {
    id: 'card-3',
    term: 'Anfield',
    forbiddenWords: ['Liverpool', 'Tribun', 'Ingiltere', 'Stadyum', 'Kirmizi'],
    category: 'stadium',
    difficulty: 'medium',
    language: 'tr',
    isActive: true,
  },
];

function createTestMatch(overrides = {}) {
  return createMatch({
    cards: SAMPLE_TEST_CARDS,
    settings: {
      ...defaultSettings,
      ...overrides,
    },
    teamNames: ['Kirmizi Takim', 'Beyaz Takim'],
  });
}

test('createMatch initializes score, round and timer state', () => {
  const match = createTestMatch({ roundDurationSeconds: 45, totalRounds: 8 });

  assert.equal(match.teams.length, 2);
  assert.equal(match.teams[0].score, 0);
  assert.equal(match.teams[1].score, 0);
  assert.equal(match.currentRound, 1);
  assert.equal(match.remainingSeconds, 45);
  assert.equal(match.settings.totalRounds, 8);
  assert.equal(getCurrentCard(match).id.length > 0, true);
});

test('markCorrect adds score, logs action and advances card', () => {
  const match = createTestMatch();
  const firstCardId = getCurrentCard(match).id;
  const nextMatch = markCorrect(match);

  assert.equal(nextMatch.teams[0].score, 1);
  assert.equal(nextMatch.roundStats.correctCount, 1);
  assert.equal(nextMatch.roundStats.roundScoreDelta, 1);
  assert.equal(nextMatch.eventLog.length, 1);
  assert.equal(nextMatch.eventLog[0].action, 'correct');
  assert.notEqual(getCurrentCard(nextMatch).id, firstCardId);
});

test('markTabu applies penalty and records tabu count', () => {
  const match = createTestMatch({ tabuPenalty: -2 });
  const nextMatch = markTabu(match);

  assert.equal(nextMatch.teams[0].score, -2);
  assert.equal(nextMatch.roundStats.tabuCount, 1);
  assert.equal(nextMatch.roundStats.roundScoreDelta, -2);
  assert.equal(nextMatch.eventLog[0].action, 'tabu');
});

test('pass limit blocks extra passes once limit is reached', () => {
  let match = createTestMatch({ passLimitEnabled: true, passLimitPerRound: 1 });

  assert.equal(canUsePass(match), true);
  match = markPass(match);
  assert.equal(match.roundStats.passCount, 1);
  assert.equal(canUsePass(match), false);

  const blockedMatch = markPass(match);
  assert.equal(blockedMatch, match);
  assert.equal(blockedMatch.eventLog.length, 1);
});

test('startNextRound archives round summary, switches team and resets timer', () => {
  let match = createTestMatch({ roundDurationSeconds: 50 });
  match = markCorrect(match);
  match = markTabu(match);

  const nextRound = startNextRound(match);

  assert.equal(nextRound.currentRound, 2);
  assert.equal(nextRound.activeTeamIndex, 1);
  assert.equal(nextRound.remainingSeconds, 50);
  assert.equal(nextRound.roundStats.correctCount, 0);
  assert.equal(nextRound.roundStats.tabuCount, 0);
  assert.equal(nextRound.history.length, 1);
  assert.equal(nextRound.history[0].stats.correctCount, 1);
  assert.equal(nextRound.history[0].stats.tabuCount, 1);
});

test('tick never drops the timer below zero', () => {
  const match = createTestMatch({ roundDurationSeconds: 1 });
  const afterOneTick = tick(match);
  const afterTwoTicks = tick(afterOneTick);

  assert.equal(afterOneTick.remainingSeconds, 0);
  assert.equal(afterTwoTicks.remainingSeconds, 0);
});
