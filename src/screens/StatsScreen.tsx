import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { SecondaryButton } from '../components/Button';
import { Panel } from '../components/Panel';
import { StatChip } from '../components/StatChip';
import { CompletedMatchRecord, MatchStatsSummary } from '../storage/history';
import { colors, spacing } from '../theme/tokens';

type StatsScreenProps = {
  recentMatches: CompletedMatchRecord[];
  statsSummary: MatchStatsSummary;
  onBack: () => void;
};

export function StatsScreen({ recentMatches, statsSummary, onBack }: StatsScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerRow}>
        <SecondaryButton label="Geri" onPress={onBack} />
      </View>

      <Panel>
        <Text style={styles.sectionTitle}>Genel Performans</Text>
        <View style={styles.chipRow}>
          <StatChip label="Mac" value={`${statsSummary.matchesPlayed}`} />
          <StatChip label="Tur" value={`${statsSummary.roundsPlayed}`} />
          <StatChip label="Aksiyon ort." value={`${statsSummary.averageActionsPerMatch}`} />
          <StatChip label="En iyi skor" value={`${statsSummary.bestScore}`} />
        </View>
      </Panel>

      <Panel>
        <Text style={styles.sectionTitle}>Toplam Aksiyon</Text>
        <View style={styles.chipRow}>
          <StatChip label="Dogru" value={`${statsSummary.correctCount}`} />
          <StatChip label="Pas" value={`${statsSummary.passCount}`} />
          <StatChip label="Tabu" value={`${statsSummary.tabuCount}`} />
          <StatChip label="Toplam" value={`${statsSummary.totalActions}`} />
        </View>
      </Panel>

      <Panel>
        <Text style={styles.sectionTitle}>Son Maclar</Text>
        {recentMatches.length === 0 ? (
          <Text style={styles.emptyText}>Henuz tamamlanmis mac yok.</Text>
        ) : (
          recentMatches.map((match) => (
            <View key={match.id} style={styles.matchRow}>
              <View style={styles.matchRowHeader}>
                <Text style={styles.matchTitle}>
                  {match.isDraw ? 'Berabere' : `${match.winnerName} kazandi`}
                </Text>
                <Text style={styles.matchDate}>
                  {new Date(match.completedAt).toLocaleDateString('tr-TR')}
                </Text>
              </View>
              <View style={styles.matchTeams}>
                {match.teams.map((team) => (
                  <View key={team.id} style={styles.scorePill}>
                    <Text style={styles.scorePillText}>
                      {team.name}: {team.score}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </Panel>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  headerRow: {
    alignItems: 'flex-start',
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
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  matchRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingVertical: spacing.md,
  },
  matchRowHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  matchTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  matchDate: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  matchTeams: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  scorePill: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  scorePillText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
});
