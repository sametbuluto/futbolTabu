import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '../components/Button';
import { DangerButton } from '../components/DangerButton';
import { Panel } from '../components/Panel';
import { StatChip } from '../components/StatChip';
import { MatchState, Card } from '../types/game';
import { colors, spacing } from '../theme/tokens';
import { formatCategory } from '../utils/formatCategory';

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
  const activeTeam = match.teams[match.activeTeamIndex];
  const timerColor = match.remainingSeconds <= 10 ? colors.danger : colors.textPrimary;
  const passValue = match.settings.passLimitEnabled
    ? `${match.roundStats.passCount}/${match.settings.passLimitPerRound ?? 0}`
    : `${match.roundStats.passCount}`;

  return (
    <View style={styles.gameScreen}>
      <View style={styles.scoreboard}>
        {match.teams.map((team, index) => (
          <View
            key={team.id}
            style={[styles.scoreTile, index === match.activeTeamIndex ? styles.scoreTileActive : null]}
          >
            <Text style={styles.scoreTeamName}>{team.name}</Text>
            <Text style={styles.scoreValue}>{team.score}</Text>
          </View>
        ))}
      </View>

      <View style={styles.gameTopRow}>
        <View style={styles.roundSummary}>
          <Text style={styles.roundSummaryLabel}>Tur</Text>
          <Text style={styles.roundSummaryValue}>
            {match.currentRound}/{match.settings.totalRounds}
          </Text>
        </View>

        <View style={styles.gameBadgeRow}>
          <StatChip label="Aktif takim" value={activeTeam.name} />
          <StatChip label="Pas" value={passValue} />
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
      </View>

      <View style={styles.mainPlayArea}>
        <Panel style={styles.cardPanel}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardCategory}>{formatCategory(currentCard.category)}</Text>
            <View style={styles.timerInline}>
              <Text style={styles.timerLabel}>Sure</Text>
              <Text style={[styles.timerValue, { color: timerColor }]}>{match.remainingSeconds}</Text>
            </View>
          </View>

          <Text style={styles.cardTerm}>{currentCard.term}</Text>
          <Text style={styles.forbiddenSectionLabel}>Tabu kelimeler</Text>
          <View style={styles.forbiddenGrid}>
            {currentCard.forbiddenWords.map((word) => (
              <View key={word} style={styles.forbiddenItem}>
                <Text style={styles.forbiddenText}>{word}</Text>
              </View>
            ))}
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
  gameTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  roundSummary: {
    gap: 2,
  },
  roundSummaryLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  roundSummaryValue: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  gameBadgeRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  pauseButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  pauseIcon: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
  },
  pauseIconBar: {
    backgroundColor: colors.textPrimary,
    borderRadius: 999,
    height: 14,
    width: 4,
  },
  mainPlayArea: {
    flex: 1,
    gap: spacing.md,
  },
  cardPanel: {
    flex: 1,
    minHeight: 0,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  cardCategory: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  timerInline: {
    alignItems: 'flex-end',
    backgroundColor: colors.surfaceRaised,
    borderRadius: 16,
    minWidth: 82,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  timerLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  timerValue: {
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 34,
    marginTop: 2,
  },
  cardTerm: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 36,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  forbiddenSectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  forbiddenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  forbiddenItem: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: '48%',
  },
  forbiddenText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
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
