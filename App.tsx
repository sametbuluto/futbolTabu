import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PrimaryButton, SecondaryButton } from './src/components/Button';
import { Panel } from './src/components/Panel';
import { StatChip } from './src/components/StatChip';
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
import {
  clearActiveMatchSession,
  loadActiveMatchSession,
  saveActiveMatchSession,
  type PersistedMatchSession,
} from './src/storage/session';
import { MatchState } from './src/types/game';
import { colors, spacing } from './src/theme/tokens';

type Screen = 'home' | 'setup' | 'rules' | 'countdown' | 'game' | 'summary' | 'result';

type SetupFormState = {
  teamOne: string;
  teamTwo: string;
  roundDurationSeconds: number;
  totalRounds: number;
  passLimitEnabled: boolean;
  passLimitPerRound: number;
  soundEnabled: boolean;
};

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
  const previousScreenRef = useRef<Screen>('home');
  const audio = useGameAudio(setup.soundEnabled);

  useEffect(() => {
    async function hydrateSession() {
      const session = await loadActiveMatchSession();
      setSavedSession(session);
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
    const shouldPersist = match && (screen === 'countdown' || screen === 'game' || screen === 'summary');

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

  const currentCard = useMemo(() => {
    if (!match) {
      return null;
    }

    return getCurrentCard(match);
  }, [match]);

  const canPass = match ? canUsePass(match) : false;

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

  function renderHomeScreen() {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Futbol Parti Oyunu</Text>
          <Text style={styles.heroTitle}>Stadyum Tabu</Text>
          <Text style={styles.heroText}>
            Klasik tabu akisini futbol temasi, hizli tur gecisleri ve tek cihaz oyunu icin
            optimize edilmis arayuzle baslat.
          </Text>
        </View>

        <Panel>
          <Text style={styles.sectionTitle}>Neler hazir?</Text>
          <View style={styles.chipRow}>
            <StatChip label="Kart Havuzu" value={`${SAMPLE_CARDS.length} kart`} />
            <StatChip label="Format" value="2 takim" />
            <StatChip label="Mod" value="Offline" />
            <StatChip label="Ses" value={setup.soundEnabled ? 'Acik' : 'Kapali'} />
          </View>
        </Panel>

        {savedSession ? (
          <Panel>
            <Text style={styles.sectionTitle}>Aktif mac bulundu</Text>
            <Text style={styles.bodyText}>
              Uygulama kapanirsa aktif mac son kaydedilen state ile tekrar acilabilir.
            </Text>
            <View style={styles.buttonStack}>
              <PrimaryButton label="Maci surdur" onPress={restoreSavedSession} />
              <SecondaryButton label="Kaydi sil" onPress={discardSavedSession} />
            </View>
          </Panel>
        ) : null}

        <View style={styles.buttonStack}>
          <PrimaryButton label="Yeni Oyun" onPress={() => setScreen('setup')} />
          <SecondaryButton label="Kurallar" onPress={() => setScreen('rules')} />
        </View>
      </ScrollView>
    );
  }

  function renderRulesScreen() {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <SecondaryButton label="Geri" onPress={() => setScreen('home')} />
        </View>

        <Panel>
          <Text style={styles.sectionTitle}>Oyun Akisi</Text>
          <Text style={styles.bodyText}>
            Iki takim olusturulur. Her turda aktif takim bir kart aciklar. Anlatan kisi ana
            kelimeyi soylemeden, ekrandaki yasakli kelimeleri kullanmadan takim arkadasina
            anlattirir.
          </Text>
        </Panel>

        <Panel>
          <Text style={styles.sectionTitle}>Butonlar</Text>
          <Text style={styles.bodyText}>Dogru: puan ekler ve siradaki karta gecer.</Text>
          <Text style={styles.bodyText}>Pas: karti atlar ve siradaki karta gecer.</Text>
          <Text style={styles.bodyText}>Tabu: ceza puani uygular ve siradaki karta gecer.</Text>
        </Panel>

        <Panel>
          <Text style={styles.sectionTitle}>Recovery Politikasi</Text>
          <Text style={styles.bodyText}>
            Oyun countdown, aktif tur veya tur ozeti ekranindayken cihazdan cikilsa bile aktif
            session saklanir. Mac bittiginde veya kullanici kaydi silerse bu session temizlenir.
          </Text>
        </Panel>

        <Panel>
          <Text style={styles.sectionTitle}>Ses Atmosferi</Text>
          <Text style={styles.bodyText}>
            Tur baslangicinda hakem dudugu, tur bitisinde mac sonu dudugu ve kart gecislerinde
            aksiyon efektleri kullanilir.
          </Text>
        </Panel>
      </ScrollView>
    );
  }

  function renderSetupScreen() {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <SecondaryButton label="Geri" onPress={() => setScreen('home')} />
        </View>

        <Panel>
          <Text style={styles.sectionTitle}>Takimlar</Text>
          <Text style={styles.inputLabel}>Takim 1</Text>
          <TextInput
            autoCapitalize="words"
            onChangeText={(value) => updateSetup('teamOne', value)}
            placeholder="Takim 1"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            value={setup.teamOne}
          />

          <Text style={styles.inputLabel}>Takim 2</Text>
          <TextInput
            autoCapitalize="words"
            onChangeText={(value) => updateSetup('teamTwo', value)}
            placeholder="Takim 2"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            value={setup.teamTwo}
          />
        </Panel>

        <Panel>
          <Text style={styles.sectionTitle}>Oyun Ayarlari</Text>
          <SettingRow
            label="Tur suresi"
            onDecrement={() =>
              updateSetup('roundDurationSeconds', Math.max(30, setup.roundDurationSeconds - 15))
            }
            onIncrement={() =>
              updateSetup('roundDurationSeconds', Math.min(120, setup.roundDurationSeconds + 15))
            }
            value={`${setup.roundDurationSeconds} sn`}
          />
          <SettingRow
            label="Toplam tur"
            onDecrement={() => updateSetup('totalRounds', Math.max(2, setup.totalRounds - 1))}
            onIncrement={() => updateSetup('totalRounds', Math.min(20, setup.totalRounds + 1))}
            value={`${setup.totalRounds}`}
          />
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.settingLabel}>Pas limiti</Text>
              <Text style={styles.settingHint}>Tur basina sinir koymak icin aktif et.</Text>
            </View>
            <Switch
              onValueChange={(value) => updateSetup('passLimitEnabled', value)}
              thumbColor={setup.passLimitEnabled ? colors.success : colors.surfaceRaised}
              trackColor={{ false: colors.surfaceRaised, true: colors.successMuted }}
              value={setup.passLimitEnabled}
            />
          </View>

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.settingLabel}>Ses efektleri</Text>
              <Text style={styles.settingHint}>Hakem dudugu ve kart aksiyon seslerini acar.</Text>
            </View>
            <Switch
              onValueChange={(value) => updateSetup('soundEnabled', value)}
              thumbColor={setup.soundEnabled ? colors.success : colors.surfaceRaised}
              trackColor={{ false: colors.surfaceRaised, true: colors.successMuted }}
              value={setup.soundEnabled}
            />
          </View>

          {setup.passLimitEnabled ? (
            <SettingRow
              label="Pas hakki"
              onDecrement={() =>
                updateSetup('passLimitPerRound', Math.max(1, setup.passLimitPerRound - 1))
              }
              onIncrement={() =>
                updateSetup('passLimitPerRound', Math.min(10, setup.passLimitPerRound + 1))
              }
              value={`${setup.passLimitPerRound}`}
            />
          ) : null}
        </Panel>

        <PrimaryButton label="Oyunu Baslat" onPress={launchMatch} />
      </ScrollView>
    );
  }

  function renderCountdownScreen() {
    if (!match) {
      return null;
    }

    const activeTeam = match.teams[match.activeTeamIndex];

    return (
      <View style={styles.centeredScreen}>
        <Text style={styles.countdownLabel}>Siradaki takim</Text>
        <Text style={styles.countdownTeam}>{activeTeam.name}</Text>
        <Text style={styles.countdownValue}>{countdown}</Text>
      </View>
    );
  }

  function renderGameScreen() {
    if (!match || !currentCard) {
      return null;
    }

    const activeTeam = match.teams[match.activeTeamIndex];
    const timerColor = match.remainingSeconds <= 10 ? colors.danger : colors.textPrimary;

    return (
      <View style={styles.gameScreen}>
        <View style={styles.scoreboard}>
          {match.teams.map((team, index) => (
            <View
              key={team.id}
              style={[
                styles.scoreTile,
                index === match.activeTeamIndex ? styles.scoreTileActive : null,
              ]}
            >
              <Text style={styles.scoreTeamName}>{team.name}</Text>
              <Text style={styles.scoreValue}>{team.score}</Text>
            </View>
          ))}
        </View>

        <View style={styles.roundMetaRow}>
          <StatChip label="Tur" value={`${match.currentRound}/${match.settings.totalRounds}`} />
          <StatChip label="Aktif takim" value={activeTeam.name} />
          <StatChip label="Pas" value={`${match.roundStats.passCount}`} />
          <StatChip label="Log" value={`${match.eventLog.length} aksiyon`} />
          <StatChip label="Ses" value={setup.soundEnabled ? 'Acik' : 'Kapali'} />
        </View>

        <Panel style={styles.timerPanel}>
          <Text style={styles.timerLabel}>Kalan sure</Text>
          <Text style={[styles.timerValue, { color: timerColor }]}>
            {match.remainingSeconds}
          </Text>
        </Panel>

        <Panel style={styles.cardPanel}>
          <Text style={styles.cardCategory}>{formatCategory(currentCard.category)}</Text>
          <Text style={styles.cardTerm}>{currentCard.term}</Text>
          <View style={styles.forbiddenList}>
            {currentCard.forbiddenWords.map((word) => (
              <View key={word} style={styles.forbiddenPill}>
                <Text style={styles.forbiddenText}>{word}</Text>
              </View>
            ))}
          </View>
        </Panel>

        <View style={styles.actionStack}>
          <PrimaryButton label="Dogru" onPress={() => handleRoundAction('correct')} />
          <SecondaryButton
            disabled={!canPass}
            label={canPass ? 'Pas' : 'Pas bitti'}
            onPress={() => handleRoundAction('pass')}
          />
          <DangerButton label="Tabu" onPress={() => handleRoundAction('tabu')} />
        </View>

        {undoState ? (
          <View style={styles.undoBar}>
            <Text style={styles.undoText}>{undoState.actionLabel} kaydedildi.</Text>
            <Pressable onPress={undoLastAction} style={styles.undoButton}>
              <Text style={styles.undoButtonText}>Geri al</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    );
  }

  function renderSummaryScreen() {
    if (!match) {
      return null;
    }

    const activeTeam = match.teams[match.activeTeamIndex];

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Panel>
          <Text style={styles.sectionTitle}>Tur Ozeti</Text>
          <Text style={styles.summaryTeam}>{activeTeam.name}</Text>
          <View style={styles.chipRow}>
            <StatChip label="Dogru" value={`${match.roundStats.correctCount}`} />
            <StatChip label="Pas" value={`${match.roundStats.passCount}`} />
            <StatChip label="Tabu" value={`${match.roundStats.tabuCount}`} />
            <StatChip label="Tur puani" value={`${match.roundStats.roundScoreDelta}`} />
          </View>
        </Panel>

        <Panel>
          <Text style={styles.sectionTitle}>Toplam Skor</Text>
          {match.teams.map((team) => (
            <View key={team.id} style={styles.summaryScoreRow}>
              <Text style={styles.summaryScoreName}>{team.name}</Text>
              <Text style={styles.summaryScoreValue}>{team.score}</Text>
            </View>
          ))}
        </Panel>

        <Panel>
          <Text style={styles.sectionTitle}>Son aksiyonlar</Text>
          {match.eventLog.slice(-5).reverse().map((event) => (
            <View key={event.id} style={styles.logRow}>
              <Text style={styles.logTerm}>{event.cardTerm}</Text>
              <Text style={styles.logMeta}>
                {event.action} • Tur {event.roundNumber} • {event.timestamp.slice(11, 19)}
              </Text>
            </View>
          ))}
        </Panel>

        <PrimaryButton
          label={match.currentRound >= match.settings.totalRounds ? 'Sonucu Gor' : 'Sonraki Tur'}
          onPress={openNextRound}
        />
      </ScrollView>
    );
  }

  function renderResultScreen() {
    if (!match) {
      return null;
    }

    const winner = [...match.teams].sort((left, right) => right.score - left.score)[0];
    const isDraw = match.teams[0].score === match.teams[1].score;

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Panel>
          <Text style={styles.sectionTitle}>Mac Sonucu</Text>
          <Text style={styles.resultHeadline}>{isDraw ? 'Berabere' : `${winner.name} kazandi`}</Text>
          {match.teams.map((team) => (
            <View key={team.id} style={styles.summaryScoreRow}>
              <Text style={styles.summaryScoreName}>{team.name}</Text>
              <Text style={styles.summaryScoreValue}>{team.score}</Text>
            </View>
          ))}
        </Panel>

        <View style={styles.buttonStack}>
          <PrimaryButton label="Ayni ayarlarla tekrar oyna" onPress={replayMatch} />
          <SecondaryButton label="Ana menuye don" onPress={resetToHome} />
        </View>
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      {screen === 'home' ? renderHomeScreen() : null}
      {screen === 'setup' ? renderSetupScreen() : null}
      {screen === 'rules' ? renderRulesScreen() : null}
      {screen === 'countdown' ? renderCountdownScreen() : null}
      {screen === 'game' ? renderGameScreen() : null}
      {screen === 'summary' ? renderSummaryScreen() : null}
      {screen === 'result' ? renderResultScreen() : null}
    </SafeAreaView>
  );
}

type SettingRowProps = {
  label: string;
  value: string;
  onDecrement: () => void;
  onIncrement: () => void;
};

function SettingRow({ label, value, onDecrement, onIncrement }: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <View style={styles.stepper}>
        <Pressable onPress={onDecrement} style={styles.stepperButton}>
          <Text style={styles.stepperButtonText}>-</Text>
        </Pressable>
        <Text style={styles.stepperValue}>{value}</Text>
        <Pressable onPress={onIncrement} style={styles.stepperButton}>
          <Text style={styles.stepperButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

type DangerButtonProps = {
  label: string;
  onPress: () => void;
};

function DangerButton({ label, onPress }: DangerButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.dangerButton, pressed && styles.buttonPressed]}
    >
      <Text style={styles.dangerButtonLabel}>{label}</Text>
    </Pressable>
  );
}

function formatCategory(category: string) {
  const labels: Record<string, string> = {
    club: 'Kulup',
    manager: 'Teknik direktor',
    national_team: 'Milli takim',
    player: 'Futbolcu',
    stadium: 'Stadyum',
    term: 'Terim',
  };

  return labels[category] ?? category;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  hero: {
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  eyebrow: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 40,
    fontWeight: '900',
    lineHeight: 44,
  },
  heroText: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  buttonStack: {
    gap: spacing.md,
  },
  headerRow: {
    alignItems: 'flex-start',
  },
  bodyText: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  inputLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  settingLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  settingHint: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  stepper: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stepperButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  stepperButtonText: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  stepperValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    minWidth: 56,
    textAlign: 'center',
  },
  centeredScreen: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  countdownLabel: {
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  countdownTeam: {
    color: colors.textPrimary,
    fontSize: 36,
    fontWeight: '900',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  countdownValue: {
    color: colors.success,
    fontSize: 112,
    fontWeight: '900',
    lineHeight: 112,
  },
  gameScreen: {
    flex: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  scoreboard: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  scoreTile: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    padding: spacing.md,
  },
  scoreTileActive: {
    borderColor: colors.success,
  },
  scoreTeamName: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  scoreValue: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: '900',
  },
  roundMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timerPanel: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  timerLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  timerValue: {
    fontSize: 64,
    fontWeight: '900',
    lineHeight: 68,
  },
  cardPanel: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 320,
  },
  cardCategory: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  cardTerm: {
    color: colors.textPrimary,
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 42,
    marginBottom: spacing.lg,
  },
  forbiddenList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  forbiddenPill: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  forbiddenText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  actionStack: {
    gap: spacing.sm,
  },
  dangerButton: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: 18,
    minHeight: 58,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dangerButtonLabel: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  buttonPressed: {
    opacity: 0.86,
  },
  summaryTeam: {
    color: colors.success,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  summaryScoreRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  summaryScoreName: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '700',
  },
  summaryScoreValue: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '900',
  },
  resultHeadline: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  undoBar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  undoText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '700',
  },
  undoButton: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  undoButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  logRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingVertical: spacing.sm,
  },
  logTerm: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  logMeta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
