import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme/tokens';

type CountdownScreenProps = {
  activeTeamName: string;
  countdown: number;
};

export function CountdownScreen({ activeTeamName, countdown }: CountdownScreenProps) {
  return (
    <View style={styles.centeredScreen}>
      <Text style={styles.countdownLabel}>Siradaki takim</Text>
      <Text style={styles.countdownTeam}>{activeTeamName}</Text>
      <Text style={styles.countdownValue}>{countdown}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
