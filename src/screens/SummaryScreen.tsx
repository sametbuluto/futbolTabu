import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../components/Button';
import { Panel } from '../components/Panel';
import { StatChip } from '../components/StatChip';
import { MatchState } from '../types/game';
import { colors, spacing } from '../theme/tokens';

type SummaryScreenProps = {
  match: MatchState;
  onNextRound: () => void;
};

export function SummaryScreen({ match, onNextRound }: SummaryScreenProps) {
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
        onPress={onNextRound}
      />
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
  summaryTeam: {
    color: colors.success,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
