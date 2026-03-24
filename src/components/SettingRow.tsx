import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme/tokens';

type SettingRowProps = {
  label: string;
  value: string;
  onDecrement: () => void;
  onIncrement: () => void;
};

export function SettingRow({ label, value, onDecrement, onIncrement }: SettingRowProps) {
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

const styles = StyleSheet.create({
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
});
