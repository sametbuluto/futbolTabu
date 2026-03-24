import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme/tokens';

type StatChipProps = {
  label: string;
  value: string;
};

export function StatChip({ label, value }: StatChipProps) {
  return (
    <View style={styles.chip}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 16,
    gap: 2,
    minWidth: 96,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  value: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
});
