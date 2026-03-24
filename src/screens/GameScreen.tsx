import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '../components/Button';
import { DangerButton } from '../components/DangerButton';
import { Panel } from '../components/Panel';
import { ProgressBar } from '../components/ProgressBar';
import { MatchState, Card } from '../types/game';
import { colors, spacing } from '../theme/tokens';

type GameScreenProps = {
  match: MatchState;
  currentCard: Card;
  canPass: boolean;
  undoLabel: string | null;
  onPause: () => void;
  onCorrect: () => void;
  onPass: () => void;
  onTabu: () => void;
  onUndo: () => void;
};

export function GameScreen({
  match,
  currentCard,
  canPass,
  undoLabel,
  onPause,
  onCorrect,
  onPass,
  onTabu,
  onUndo,
}: GameScreenProps) {
  const leftTeam = match.teams[0];
  const rightTeam = match.teams[1];
  const timerColor = match.remainingSeconds <= 10 ? colors.danger : colors.textPrimary;
  const timeProgress = match.remainingSeconds / match.settings.roundDurationSeconds;
  const passValue = match.settings.passLimitEnabled
    ? `${match.roundStats.passCount}/${match.settings.passLimitPerRound ?? 0}`
    : `${match.roundStats.passCount}`;

  return (
    <View style={styles.gameScreen}>
      <View style={styles.scoreboard}>
        <View
          style={[styles.scoreTile, match.activeTeamIndex === 0 ? styles.scoreTileActive : null]}
        >
          <Text style={styles.scoreTeamName}>{leftTeam.name}</Text>
          <Text style={styles.scoreValue}>{leftTeam.score}</Text>
        </View>
        <View style={styles.roundBadgeWrap}>
          <View style={styles.roundBadgeConnector} />
        </View>
        <View style={styles.roundBadge}>
          <Text style={styles.roundBadgeLabel}>Tur</Text>
          <Text style={styles.roundBadgeValue}>
            {match.currentRound}/{match.settings.totalRounds}
          </Text>
        </View>
        <View
          style={[styles.scoreTile, match.activeTeamIndex === 1 ? styles.scoreTileActive : null]}
        >
          <Text style={styles.scoreTeamName}>{rightTeam.name}</Text>
          <Text style={styles.scoreValue}>{rightTeam.score}</Text>
        </View>
      </View>

      <View style={styles.utilityRow}>
        <View style={styles.timerBarWrap}>
          <ProgressBar
            tone={match.remainingSeconds <= 10 ? 'danger' : 'neutral'}
            value={timeProgress}
          />
        </View>
        <Pressable
          accessibilityLabel="Oyunu duraklat"
          accessibilityRole="button"
          onPress={onPause}
          style={({ pressed }) => [styles.pauseButton, pressed ? styles.buttonPressed : null]}
        >
          <View style={styles.pauseIcon}>
            <View style={styles.pauseIconBar} />
            <View style={styles.pauseIconBar} />
          </View>
        </Pressable>
      </View>

      <View style={styles.mainPlayArea}>
        <Panel style={styles.cardPanel}>
          <View style={styles.cardContent}>
            <View style={styles.termRow}>
              <View style={styles.termMetaPill}>
                <Text style={styles.termMetaLabel}>Pas</Text>
                <Text style={styles.termMetaValue}>{passValue}</Text>
              </View>
              <Text style={styles.cardTerm}>{currentCard.term}</Text>
              <View style={styles.termMetaPill}>
                <Text style={styles.termMetaLabel}>Sure</Text>
                <Text style={[styles.termMetaValue, { color: timerColor }]}>
                  {match.remainingSeconds}
                </Text>
              </View>
            </View>
            <View style={styles.forbiddenSection}>
              <Text style={styles.forbiddenSectionLabel}>Tabu kelimeler</Text>
              <View style={styles.forbiddenList}>
                {currentCard.forbiddenWords.map((word, index) => (
                  <View key={word} style={styles.forbiddenRow}>
                    <View style={styles.forbiddenIndex}>
                      <Text style={styles.forbiddenIndexText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.forbiddenText}>{word}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Panel>

        <View style={styles.actionRow}>
          <SecondaryButton
            disabled={!canPass}
            label={canPass ? 'Pas' : 'Pas bitti'}
            labelStyle={styles.gameActionLabel}
            onPress={onPass}
            style={styles.gameActionButton}
          />
          <DangerButton
            label="Tabu"
            onPress={onTabu}
            style={styles.gameActionButton}
            textStyle={styles.gameActionLabel}
          />
          <PrimaryButton
            label="Dogru"
            labelStyle={styles.gameActionLabel}
            onPress={onCorrect}
            style={styles.gameActionButton}
          />
        </View>
      </View>

      {undoLabel ? (
        <View style={styles.undoBar}>
          <Text style={styles.undoText}>{undoLabel} kaydedildi.</Text>
          <Pressable onPress={onUndo} style={styles.undoButton}>
            <Text style={styles.undoButtonText}>Geri al</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  gameScreen: {
    flex: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  scoreboard: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  scoreTile: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    minHeight: 82,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  scoreTileActive: {
    borderColor: colors.success,
  },
  scoreTeamName: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  scoreValue: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '900',
  },
  roundBadgeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 0,
  },
  roundBadgeConnector: {
    backgroundColor: colors.border,
    borderRadius: 999,
    height: 64,
    width: 1,
  },
  roundBadge: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    marginHorizontal: -4,
    minWidth: 76,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  roundBadgeLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  roundBadgeValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  utilityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timerBarWrap: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: 0,
  },
  pauseButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  pauseIcon: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
    justifyContent: 'center',
  },
  pauseIconBar: {
    backgroundColor: colors.textPrimary,
    borderRadius: 999,
    height: 10,
    width: 3,
  },
  mainPlayArea: {
    flex: 1,
    gap: spacing.xs,
  },
  cardPanel: {
    flex: 1,
    justifyContent: 'flex-start',
    minHeight: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  cardContent: {
    alignItems: 'center',
    gap: spacing.md,
    justifyContent: 'flex-start',
    width: '100%',
  },
  termRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  termMetaPill: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    width: 68,
  },
  termMetaLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  termMetaValue: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2,
  },
  cardTerm: {
    color: colors.textPrimary,
    fontSize: 30,
    flex: 1,
    fontWeight: '900',
    lineHeight: 34,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  forbiddenSection: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 0,
    padding: spacing.sm,
    width: '100%',
  },
  forbiddenSectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  forbiddenList: {
    gap: spacing.sm,
    width: '100%',
  },
  forbiddenRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    width: '100%',
  },
  forbiddenIndex: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  forbiddenIndexText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '800',
  },
  forbiddenText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.xs : 0,
  },
  gameActionButton: {
    flex: 1,
    minHeight: 54,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  gameActionLabel: {
    fontSize: 16,
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
  buttonPressed: {
    opacity: 0.86,
  },
});
