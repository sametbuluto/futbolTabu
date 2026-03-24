import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { useGameAudio } from './src/audio/useGameAudio';
import { SAMPLE_CARDS } from './src/data/cards';
import {
  canUsePass,
  createMatch,
  defaultSettings,
  getCurrentCard,
  markCorrect,
  markPass,
  markTabu,
  startNextRound,
  tick,
} from './src/game/engine';
import { HomeScreen } from './src/screens/HomeScreen';
import { RulesScreen } from './src/screens/RulesScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { CountdownScreen } from './src/screens/CountdownScreen';
import { GameScreen } from './src/screens/GameScreen';
import { PauseOverlay } from './src/screens/PauseOverlay';
import { SummaryScreen } from './src/screens/SummaryScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import {
  buildMatchStatsSummary,
  loadCompletedMatches,
  saveCompletedMatch,
  type CompletedMatchRecord,
} from './src/storage/history';
import {
  clearActiveMatchSession,
  loadActiveMatchSession,
  saveActiveMatchSession,
  type PersistedMatchSession,
} from './src/storage/session';
import { colors } from './src/theme/tokens';
import { MatchState } from './src/types/game';
import { SetupFormState } from './src/types/ui';

type Screen =
  | 'home'
  | 'setup'
  | 'rules'
  | 'stats'
  | 'countdown'
  | 'game'
  | 'paused'
  | 'summary'
  | 'result';

type UndoState = {
  previousMatch: MatchState;
  actionLabel: string;
};

const initialSetupState: SetupFormState = {
  teamOne: 'Kirmizi Takim',
  teamTwo: 'Beyaz Takim',
  roundDurationSeconds: defaultSettings.roundDurationSeconds,
  totalRounds: defaultSettings.totalRounds,
  passLimitEnabled: false,
  passLimitPerRound: 3,
  soundEnabled: true,
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [setup, setSetup] = useState<SetupFormState>(initialSetupState);
  const [match, setMatch] = useState<MatchState | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [undoState, setUndoState] = useState<UndoState | null>(null);
  const [savedSession, setSavedSession] = useState<PersistedMatchSession | null>(null);
  const [completedMatches, setCompletedMatches] = useState<CompletedMatchRecord[]>([]);
  const previousScreenRef = useRef<Screen>('home');
  const savedCompletedMatchIdsRef = useRef<Set<string>>(new Set());
  const audio = useGameAudio(setup.soundEnabled);

  useEffect(() => {
    async function hydrateSession() {
      const [session, history] = await Promise.all([loadActiveMatchSession(), loadCompletedMatches()]);
      setSavedSession(session);
      setCompletedMatches(history);
    }

    void hydrateSession();
  }, []);

  useEffect(() => {
    if (screen !== 'countdown') {
      return;
    }

    if (countdown <= 0) {
      setScreen('game');
      return;
    }

    const timeout = setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [countdown, screen]);

  useEffect(() => {
    if (screen !== 'game' || !match) {
      return;
    }

    if (match.remainingSeconds <= 0) {
      setScreen('summary');
      setUndoState(null);
      return;
    }

    const timeout = setTimeout(() => {
      setMatch((current) => (current ? tick(current) : current));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [match, screen]);

  useEffect(() => {
    if (!undoState || screen !== 'game') {
      return;
    }

    const timeout = setTimeout(() => {
      setUndoState(null);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [screen, undoState]);

  useEffect(() => {
    const previousScreen = previousScreenRef.current;

    if (screen === 'game' && previousScreen === 'countdown') {
      void audio.playRoundStart();
    }

    if (screen === 'summary' && previousScreen === 'game') {
      void audio.playRoundEnd();
    }

    previousScreenRef.current = screen;
  }, [audio, screen]);

  useEffect(() => {
    if (screen !== 'result' || !match) {
      return;
    }

    if (savedCompletedMatchIdsRef.current.has(match.id)) {
      return;
    }

    savedCompletedMatchIdsRef.current.add(match.id);
    void saveCompletedMatch(match).then((history) => {
      setCompletedMatches(history);
    });
  }, [match, screen]);

  useEffect(() => {
    const shouldPersist =
      match &&
      (screen === 'countdown' || screen === 'game' || screen === 'paused' || screen === 'summary');

    if (!shouldPersist) {
      return;
    }

    const session: PersistedMatchSession = {
      match,
      screen,
      countdown,
      setup,
      savedAt: new Date().toISOString(),
    };

    setSavedSession(session);
    void saveActiveMatchSession(session);
  }, [countdown, match, screen, setup]);

  const currentCard = useMemo(() => (match ? getCurrentCard(match) : null), [match]);
  const canPassInCurrentRound = match ? canUsePass(match) : false;
  const statsSummary = useMemo(() => buildMatchStatsSummary(completedMatches), [completedMatches]);

  function updateSetup<K extends keyof SetupFormState>(key: K, value: SetupFormState[K]) {
    setSetup((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function launchMatch() {
    const nextMatch = createMatch({
      cards: SAMPLE_CARDS,
      settings: {
        ...defaultSettings,
        roundDurationSeconds: setup.roundDurationSeconds,
        totalRounds: setup.totalRounds,
        passLimitEnabled: setup.passLimitEnabled,
        passLimitPerRound: setup.passLimitEnabled ? setup.passLimitPerRound : null,
      },
      teamNames: [setup.teamOne.trim() || 'Takim 1', setup.teamTwo.trim() || 'Takim 2'],
    });

    setMatch(nextMatch);
    setCountdown(3);
    setUndoState(null);
    savedCompletedMatchIdsRef.current.delete(nextMatch.id);
    setScreen('countdown');
  }

  function replayMatch() {
    launchMatch();
  }

  function openNextRound() {
    if (!match) {
      return;
    }

    if (match.currentRound >= match.settings.totalRounds) {
      setScreen('result');
      setUndoState(null);
      void clearActiveMatchSession();
      setSavedSession(null);
      return;
    }

    setMatch(startNextRound(match));
    setCountdown(3);
    setUndoState(null);
    setScreen('countdown');
  }

  function resetToHome() {
    setMatch(null);
    setCountdown(3);
    setUndoState(null);
    setScreen('home');
    void clearActiveMatchSession();
    setSavedSession(null);
  }

  function restoreSavedSession() {
    if (!savedSession) {
      return;
    }

    setSetup({
      ...initialSetupState,
      ...savedSession.setup,
    });
    setMatch(savedSession.match);
    setCountdown(savedSession.countdown);
    setUndoState(null);
    setScreen(savedSession.screen);
  }

  function discardSavedSession() {
    setSavedSession(null);
    void clearActiveMatchSession();
  }

  function pauseGame() {
    if (screen !== 'game') {
      return;
    }

    setScreen('paused');
    setUndoState(null);
  }

  function resumeGame() {
    if (screen !== 'paused') {
      return;
    }

    setScreen('game');
  }

  function returnToHomeWithSavedMatch() {
    if (!match) {
      setScreen('home');
      return;
    }

    const session: PersistedMatchSession = {
      match,
      screen: 'paused',
      countdown,
      setup,
      savedAt: new Date().toISOString(),
    };

    setSavedSession(session);
    void saveActiveMatchSession(session);
    setMatch(null);
    setCountdown(3);
    setUndoState(null);
    setScreen('home');
  }

  function quitMatch() {
    setMatch(null);
    setCountdown(3);
    setUndoState(null);
    setScreen('home');
    void clearActiveMatchSession();
    setSavedSession(null);
  }

  function handleRoundAction(action: 'correct' | 'pass' | 'tabu') {
    if (!match) {
      return;
    }

    const previousMatch = match;
    let nextMatch = match;
    let actionLabel = '';

    if (action === 'correct') {
      nextMatch = markCorrect(match);
      actionLabel = 'Dogru';
      void audio.playCorrect();
    }

    if (action === 'pass') {
      nextMatch = markPass(match);
      actionLabel = 'Pas';
      void audio.playPass();
    }

    if (action === 'tabu') {
      nextMatch = markTabu(match);
      actionLabel = 'Tabu';
      void audio.playTabu();
    }

    if (nextMatch === previousMatch) {
      return;
    }

    setMatch(nextMatch);
    setUndoState({
      previousMatch,
      actionLabel,
    });
  }

  function undoLastAction() {
    if (!undoState) {
      return;
    }

    setMatch(undoState.previousMatch);
    setUndoState(null);
  }

  const isPlayScreen = screen === 'game' || screen === 'paused';
  const activeTeamName = match ? match.teams[match.activeTeamIndex].name : '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      {screen === 'home' ? (
        <HomeScreen
          cardCount={SAMPLE_CARDS.length}
          onDiscardSavedSession={discardSavedSession}
          onOpenRules={() => setScreen('rules')}
          onOpenSetup={() => setScreen('setup')}
          onOpenStats={() => setScreen('stats')}
          onRestoreSavedSession={restoreSavedSession}
          recentMatches={completedMatches.slice(0, 3)}
          savedSession={savedSession}
          soundEnabled={setup.soundEnabled}
          statsSummary={statsSummary}
        />
      ) : null}
      {screen === 'rules' ? <RulesScreen onBack={() => setScreen('home')} /> : null}
      {screen === 'stats' ? (
        <StatsScreen
          onBack={() => setScreen('home')}
          recentMatches={completedMatches}
          statsSummary={statsSummary}
        />
      ) : null}
      {screen === 'setup' ? (
        <SetupScreen
          onBack={() => setScreen('home')}
          onStart={launchMatch}
          onUpdateSetup={(key, value) =>
            updateSetup(key as keyof SetupFormState, value as SetupFormState[keyof SetupFormState])
          }
          setup={setup}
        />
      ) : null}
      {screen === 'countdown' && match ? (
        <CountdownScreen activeTeamName={activeTeamName} countdown={countdown} />
      ) : null}
      {isPlayScreen && match && currentCard ? (
        <View style={styles.playStage}>
          <GameScreen
            canPass={canPassInCurrentRound}
            currentCard={currentCard}
            match={match}
            onCorrect={() => handleRoundAction('correct')}
            onPass={() => handleRoundAction('pass')}
            onPause={pauseGame}
            onTabu={() => handleRoundAction('tabu')}
            onUndo={undoLastAction}
            undoLabel={undoState?.actionLabel ?? null}
          />
          <PauseOverlay
            onQuit={quitMatch}
            onResume={resumeGame}
            onReturnHome={returnToHomeWithSavedMatch}
            visible={screen === 'paused'}
          />
        </View>
      ) : null}
      {screen === 'summary' && match ? <SummaryScreen match={match} onNextRound={openNextRound} /> : null}
      {screen === 'result' && match ? (
        <ResultScreen match={match} onReplay={replayMatch} onResetToHome={resetToHome} />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  playStage: {
    flex: 1,
  },
});
