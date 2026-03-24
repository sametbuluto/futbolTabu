import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '../components/Button';
import { DangerButton } from '../components/DangerButton';
import { Panel } from '../components/Panel';
import { colors, spacing } from '../theme/tokens';

type PauseOverlayProps = {
  visible: boolean;
  onResume: () => void;
  onReturnHome: () => void;
  onQuit: () => void;
};

export function PauseOverlay({ visible, onResume, onReturnHome, onQuit }: PauseOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.pauseOverlay}>
      <Panel style={styles.pausePanel}>
        <Text style={styles.pauseEyebrow}>Oyun duraklatildi</Text>
        <Text style={styles.pauseTitle}>Ne yapmak istiyorsun?</Text>
        <View style={styles.pauseActions}>
          <PrimaryButton label="Devam et" onPress={onResume} />
          <SecondaryButton label="Ana menuye don" onPress={onReturnHome} />
          <DangerButton label="Oyundan cik" onPress={onQuit} />
        </View>
      </Panel>
    </View>
  );
}

const styles = StyleSheet.create({
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(7, 17, 31, 0.78)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  pausePanel: {
    maxWidth: 420,
    width: '100%',
  },
  pauseEyebrow: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  pauseTitle: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
    marginBottom: spacing.lg,
  },
  pauseActions: {
    gap: spacing.sm,
  },
});
