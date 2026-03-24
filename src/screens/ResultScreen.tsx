import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '../components/Button';
import { Panel } from '../components/Panel';
import { StatChip } from '../components/StatChip';
import { MatchState } from '../types/game';
import { colors, spacing } from '../theme/tokens';

type ResultScreenProps = {
  match: MatchState;
  onReplay: () => void;
  onResetToHome: () => void;
};

export function ResultScreen({ match, onReplay, onResetToHome }: ResultScreenProps) {
  const winner = [...match.teams].sort((left, right) => right.score - left.score)[0];
  const isDraw = match.teams[0].score === match.teams[1].score;
  const totalCorrect =
    match.history.reduce((sum, round) => sum + round.stats.correctCount, 0) +
    match.roundStats.correctCount;
  const totalPass =
    match.history.reduce((sum, round) => sum + round.stats.passCount, 0) +
    match.roundStats.passCount;
  const totalTabu =
    match.history.reduce((sum, round) => sum + round.stats.tabuCount, 0) +
    match.roundStats.tabuCount;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Panel style={styles.heroPanel}>
        <Text style={styles.sectionTitle}>Mac Sonucu</Text>
        <Text style={styles.resultHeadline}>{isDraw ? 'Berabere' : `${winner.name} kazandi`}</Text>
        <View style={styles.chipRow}>
          <StatChip label="Dogru" value={`${totalCorrect}`} />
          <StatChip label="Pas" value={`${totalPass}`} />
          <StatChip label="Tabu" value={`${totalTabu}`} />
        </View>
        {match.teams.map((team) => (
          <View key={team.id} style={styles.summaryScoreRow}>
            <Text style={styles.summaryScoreName}>{team.name}</Text>
            <Text style={styles.summaryScoreValue}>{team.score}</Text>
          </View>
        ))}
      </Panel>

      <View style={styles.buttonStack}>
        <PrimaryButton label="Ayni ayarlarla tekrar oyna" onPress={onReplay} />
        <SecondaryButton label="Ana menuye don" onPress={onResetToHome} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  heroPanel: {
    borderColor: colors.successMuted,
  },
  resultHeadline: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
  buttonStack: {
    gap: spacing.md,
  },
});
