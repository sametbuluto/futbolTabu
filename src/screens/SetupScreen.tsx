import { Switch, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '../components/Button';
import { Panel } from '../components/Panel';
import { SettingRow } from '../components/SettingRow';
import { colors, spacing } from '../theme/tokens';
import { SetupFormState } from '../types/ui';

type SetupScreenProps = {
  setup: SetupFormState;
  onUpdateSetup: (key: keyof SetupFormState, value: string | number | boolean) => void;
  onBack: () => void;
  onStart: () => void;
};

export function SetupScreen({ setup, onUpdateSetup, onBack, onStart }: SetupScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerRow}>
        <SecondaryButton label="Geri" onPress={onBack} />
      </View>

      <Panel>
        <Text style={styles.sectionTitle}>Takimlar</Text>
        <Text style={styles.inputLabel}>Takim 1</Text>
        <TextInput
          autoCapitalize="words"
          onChangeText={(value) => onUpdateSetup('teamOne', value)}
          placeholder="Takim 1"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={setup.teamOne}
        />

        <Text style={styles.inputLabel}>Takim 2</Text>
        <TextInput
          autoCapitalize="words"
          onChangeText={(value) => onUpdateSetup('teamTwo', value)}
          placeholder="Takim 2"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={setup.teamTwo}
        />
      </Panel>

      <Panel>
        <Text style={styles.sectionTitle}>Oyun Ayarlari</Text>
        <SettingRow
          label="Tur suresi"
          onDecrement={() =>
            onUpdateSetup('roundDurationSeconds', Math.max(30, setup.roundDurationSeconds - 15))
          }
          onIncrement={() =>
            onUpdateSetup('roundDurationSeconds', Math.min(120, setup.roundDurationSeconds + 15))
          }
          value={`${setup.roundDurationSeconds} sn`}
        />
        <SettingRow
          label="Toplam tur"
          onDecrement={() => onUpdateSetup('totalRounds', Math.max(2, setup.totalRounds - 1))}
          onIncrement={() => onUpdateSetup('totalRounds', Math.min(20, setup.totalRounds + 1))}
          value={`${setup.totalRounds}`}
        />
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.settingLabel}>Pas limiti</Text>
            <Text style={styles.settingHint}>Tur basina sinir koymak icin aktif et.</Text>
          </View>
          <Switch
            onValueChange={(value) => onUpdateSetup('passLimitEnabled', value)}
            thumbColor={setup.passLimitEnabled ? colors.success : colors.surfaceRaised}
            trackColor={{ false: colors.surfaceRaised, true: colors.successMuted }}
            value={setup.passLimitEnabled}
          />
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.settingLabel}>Ses efektleri</Text>
            <Text style={styles.settingHint}>Hakem dudugu ve kart aksiyon seslerini acar.</Text>
          </View>
          <Switch
            onValueChange={(value) => onUpdateSetup('soundEnabled', value)}
            thumbColor={setup.soundEnabled ? colors.success : colors.surfaceRaised}
            trackColor={{ false: colors.surfaceRaised, true: colors.successMuted }}
            value={setup.soundEnabled}
          />
        </View>

        {setup.passLimitEnabled ? (
          <SettingRow
            label="Pas hakki"
            onDecrement={() =>
              onUpdateSetup('passLimitPerRound', Math.max(1, setup.passLimitPerRound - 1))
            }
            onIncrement={() =>
              onUpdateSetup('passLimitPerRound', Math.min(10, setup.passLimitPerRound + 1))
            }
            value={`${setup.passLimitPerRound}`}
          />
        ) : null}
      </Panel>

      <PrimaryButton label="Oyunu Baslat" onPress={onStart} />
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
  inputLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  settingLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  settingHint: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
});
