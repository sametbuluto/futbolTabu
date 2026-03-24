import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { SecondaryButton } from '../components/Button';
import { Panel } from '../components/Panel';
import { colors, spacing } from '../theme/tokens';

type RulesScreenProps = {
  onBack: () => void;
};

export function RulesScreen({ onBack }: RulesScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerRow}>
        <SecondaryButton label="Geri" onPress={onBack} />
      </View>

      <Panel>
        <Text style={styles.sectionTitle}>Oyun Akisi</Text>
        <Text style={styles.bodyText}>
          Iki takim olusturulur. Her turda aktif takim bir kart aciklar. Anlatan kisi ana
          kelimeyi soylemeden, ekrandaki yasakli kelimeleri kullanmadan takim arkadasina
          anlattirir.
        </Text>
      </Panel>

      <Panel>
        <Text style={styles.sectionTitle}>Butonlar</Text>
        <Text style={styles.bodyText}>Dogru: puan ekler ve siradaki karta gecer.</Text>
        <Text style={styles.bodyText}>Pas: karti atlar ve siradaki karta gecer.</Text>
        <Text style={styles.bodyText}>Tabu: ceza puani uygular ve siradaki karta gecer.</Text>
      </Panel>

      <Panel>
        <Text style={styles.sectionTitle}>Recovery Politikasi</Text>
        <Text style={styles.bodyText}>
          Oyun countdown, aktif tur veya tur ozeti ekranindayken cihazdan cikilsa bile aktif
          session saklanir. Mac bittiginde veya kullanici kaydi silerse bu session temizlenir.
        </Text>
      </Panel>

      <Panel>
        <Text style={styles.sectionTitle}>Ses Atmosferi</Text>
        <Text style={styles.bodyText}>
          Tur baslangicinda hakem dudugu, tur bitisinde mac sonu dudugu ve kart gecislerinde
          aksiyon efektleri kullanilir.
        </Text>
      </Panel>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  headerRow: {
    alignItems: 'flex-start',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  bodyText: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
});
