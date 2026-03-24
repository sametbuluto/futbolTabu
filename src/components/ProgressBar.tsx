import { StyleSheet, View } from 'react-native';

import { colors } from '../theme/tokens';

type ProgressBarProps = {
  value: number;
  tone?: 'success' | 'danger' | 'neutral';
};

export function ProgressBar({ value, tone = 'neutral' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, value));

  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          tone === 'success' ? styles.fillSuccess : null,
          tone === 'danger' ? styles.fillDanger : null,
          { width: `${clamped * 100}%` },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    backgroundColor: colors.textMuted,
    borderRadius: 999,
    height: '100%',
  },
  fillSuccess: {
    backgroundColor: colors.success,
  },
  fillDanger: {
    backgroundColor: colors.danger,
  },
});
