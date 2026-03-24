import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, spacing } from '../theme/tokens';

type PanelProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function Panel({ children, style }: PanelProps) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    padding: spacing.lg,
  },
});
