import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '../components/Button';
import { Panel } from '../components/Panel';
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
  resultHeadline: {
    color: colors.textPrimary,
    fontSize: 30,
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
  buttonStack: {
    gap: spacing.md,
  },
});
