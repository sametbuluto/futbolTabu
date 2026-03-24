import { StyleProp, StyleSheet, Text, TextStyle, ViewStyle, Pressable } from 'react-native';

import { colors, spacing } from '../theme/tokens';

type DangerButtonProps = {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function DangerButton({ label, onPress, style, textStyle }: DangerButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, style, pressed ? styles.pressed : null]}
    >
      <Text style={[styles.label, textStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.86,
  },
});
