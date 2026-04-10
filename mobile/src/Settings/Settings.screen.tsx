import React from 'react';
import { useAppTheme } from '../theme/useAppTheme';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAtom } from 'jotai';
import { appNameAtom, sectorNamesAtom, enabledSectorsAtom } from './settings.state';
import { getThemeColors, Colors } from '../theme/colors';

const DEFAULT_SECTOR_NAMES: Record<number, string> = {
  1: 'Sector 1: Aguacates',
  2: 'Sector 2: Mangos',
  3: 'Sector 3: Pencas',
  4: 'Sector 4: Pitayas',
  5: 'Sector 5',
  6: 'Sector 6',
  7: 'Sector 7',
  8: 'Sector 8',
};

const SECTOR_IDS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function SettingsScreen() {
  const scheme = useAppTheme();
  const theme = getThemeColors(scheme);
  const [appName, setAppName] = useAtom(appNameAtom);
  const [sectorNames, setSectorNames] = useAtom(sectorNamesAtom);
  const [enabledSectors, setEnabledSectors] = useAtom(enabledSectorsAtom);

  const getSectorName = (id: number) =>
    sectorNames[id] ?? DEFAULT_SECTOR_NAMES[id] ?? `Sector ${id}`;

  const handleSectorName = (id: number, value: string) => {
    setSectorNames((prev) => ({ ...prev, [id]: value }));
  };

  const handleToggle = (id: number) => {
    setEnabledSectors((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
  };

  const handleReset = () => {
    setAppName('Finca Eloy');
    setSectorNames({});
    setEnabledSectors({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backIcon, { color: Colors.primary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Configuración</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Nombre de la finca */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Nombre de la finca</Text>
          <TextInput
            value={appName}
            onChangeText={setAppName}
            placeholder="Nombre de la finca"
            placeholderTextColor={theme.textMuted}
            style={[styles.input, { color: theme.text, borderColor: theme.inactive, backgroundColor: theme.background }]}
          />
        </View>

        {/* Sectores */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Sectores</Text>
          <View style={styles.sectorList}>
            {SECTOR_IDS.map((id) => {
              const isEnabled = enabledSectors[id] ?? true;
              return (
                <View
                  key={id}
                  style={[
                    styles.sectorRow,
                    {
                      borderColor: isEnabled ? `${Colors.primary}44` : theme.inactive,
                      backgroundColor: isEnabled ? `${Colors.primary}08` : 'transparent',
                    },
                  ]}
                >
                  <View style={styles.sectorTop}>
                    <Text style={[styles.sectorLabel, { color: theme.text }]}>Sector {id}</Text>
                    {/* Toggle */}
                    <TouchableOpacity onPress={() => handleToggle(id)} activeOpacity={0.8}>
                      <View style={[styles.track, { backgroundColor: isEnabled ? Colors.primary : theme.inactive }]}>
                        <View style={[styles.thumb, { transform: [{ translateX: isEnabled ? 18 : 0 }] }]} />
                      </View>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    value={getSectorName(id)}
                    onChangeText={(v) => handleSectorName(id, v)}
                    placeholder={DEFAULT_SECTOR_NAMES[id]}
                    placeholderTextColor={theme.textMuted}
                    editable={isEnabled}
                    style={[
                      styles.input,
                      {
                        color: theme.text,
                        borderColor: theme.inactive,
                        backgroundColor: theme.background,
                        opacity: isEnabled ? 1 : 0.4,
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>
        </View>

        {/* Reset */}
        <TouchableOpacity
          onPress={handleReset}
          style={[styles.resetButton, { borderColor: theme.inactive }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.resetText, { color: theme.textMuted }]}>Restablecer valores por defecto</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 28, fontWeight: '600' },
  title: { flex: 1, fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  headerRight: { width: 48 },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  section: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  sectorList: { gap: 12 },
  sectorRow: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  sectorTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectorLabel: { fontSize: 14, fontWeight: '600' },
  track: {
    width: 46,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  resetButton: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  resetText: { fontSize: 14, fontWeight: '600' },
});
