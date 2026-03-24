import { Pressable, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';

import { colors, spacing } from '../theme/tokens';

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  style,
  labelStyle,
}: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles.primary,
        style,
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      <Text style={[styles.primaryLabel, labelStyle]}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  disabled = false,
  style,
  labelStyle,
}: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles.secondary,
        style,
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      <Text style={[styles.secondaryLabel, labelStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  primary: {
    backgroundColor: colors.success,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.86,
  },
  primaryLabel: {
    color: colors.background,
    fontSize: 17,
    fontWeight: '800',
  },
  secondaryLabel: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
});
