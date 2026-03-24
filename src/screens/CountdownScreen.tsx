import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme/tokens';

type CountdownScreenProps = {
  activeTeamName: string;
  countdown: number;
};

export function CountdownScreen({ activeTeamName, countdown }: CountdownScreenProps) {
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scale, {
        duration: 220,
        toValue: 1.04,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        duration: 180,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [countdown, scale]);

  return (
    <View style={styles.centeredScreen}>
      <View style={styles.handoffCard}>
        <Text style={styles.countdownLabel}>Siradaki takim</Text>
        <Text style={styles.countdownTeam}>{activeTeamName}</Text>
        <Text style={styles.handoffText}>Telefonu anlatana ver ve herkes hazir olsun.</Text>
      </View>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Text style={styles.countdownValue}>{countdown}</Text>
      </Animated.View>
      <Text style={styles.countdownHint}>Tur baslamak uzere</Text>
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
  handoffCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    width: '100%',
  },
  countdownLabel: {
    color: colors.textMuted,
    fontSize: 14,
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
  handoffText: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  countdownValue: {
    color: colors.success,
    fontSize: 112,
    fontWeight: '900',
    lineHeight: 112,
  },
  countdownHint: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    marginTop: spacing.md,
    textTransform: 'uppercase',
  },
});
