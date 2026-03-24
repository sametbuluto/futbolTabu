import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '../components/Button';
import { Panel } from '../components/Panel';
import { StatChip } from '../components/StatChip';
import { PersistedMatchSession } from '../storage/session';
import { colors, spacing } from '../theme/tokens';

type HomeScreenProps = {
  savedSession: PersistedMatchSession | null;
  soundEnabled: boolean;
  onRestoreSavedSession: () => void;
  onDiscardSavedSession: () => void;
  onOpenSetup: () => void;
  onOpenRules: () => void;
  cardCount: number;
};

export function HomeScreen({
  savedSession,
  soundEnabled,
  onRestoreSavedSession,
  onDiscardSavedSession,
  onOpenSetup,
  onOpenRules,
  cardCount,
}: HomeScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Futbol Parti Oyunu</Text>
        <Text style={styles.heroTitle}>Stadyum Tabu</Text>
        <Text style={styles.heroText}>
          Klasik tabu akisini futbol temasi, hizli tur gecisleri ve tek cihaz oyunu icin
          optimize edilmis arayuzle baslat.
        </Text>
      </View>

      <Panel>
        <Text style={styles.sectionTitle}>Neler hazir?</Text>
        <View style={styles.chipRow}>
          <StatChip label="Kart Havuzu" value={`${cardCount} kart`} />
          <StatChip label="Format" value="2 takim" />
          <StatChip label="Mod" value="Offline" />
          <StatChip label="Ses" value={soundEnabled ? 'Acik' : 'Kapali'} />
        </View>
      </Panel>

      {savedSession ? (
        <Panel>
          <Text style={styles.sectionTitle}>Aktif mac bulundu</Text>
          <Text style={styles.bodyText}>
            Uygulama kapanirsa aktif mac son kaydedilen state ile tekrar acilabilir.
          </Text>
          <View style={styles.buttonStack}>
            <PrimaryButton label="Maci surdur" onPress={onRestoreSavedSession} />
            <SecondaryButton label="Kaydi sil" onPress={onDiscardSavedSession} />
          </View>
        </Panel>
      ) : null}

      <View style={styles.buttonStack}>
        <PrimaryButton label="Yeni Oyun" onPress={onOpenSetup} />
        <SecondaryButton label="Kurallar" onPress={onOpenRules} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  hero: {
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  eyebrow: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 40,
    fontWeight: '900',
    lineHeight: 44,
  },
  heroText: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
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
  bodyText: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  buttonStack: {
    gap: spacing.md,
  },
});
