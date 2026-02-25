import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { useAtom } from 'jotai';
import { sectorsAtom, scheduleService } from './schedule.state';
import { getThemeColors, Colors } from '../theme/colors';
import { SectorCard } from './components/SectorCard.component';

export default function ScheduleScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme);
  const [sectors, setSectors] = useAtom(sectorsAtom);

  useEffect(() => {
    const loadData = async () => {
      try {
        const sectorsData = await scheduleService.getSectors();
        setSectors(sectorsData);
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    };
    loadData();
  }, [setSectors]);

  const handleToggleSector = async (id: number, isActive: boolean) => {
    try {
      await scheduleService.toggleSector(id, isActive);
      setSectors((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive } : s))
      );
    } catch (error) {
      console.error('Error al cambiar estado del sector:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backIcon, { color: Colors.primary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Programa</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {sectors.map((sector) => (
          <SectorCard
            key={sector.id}
            sector={sector}
            onToggle={handleToggleSector}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 28,
    fontWeight: '600',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerRight: {
    width: 48,
  },
  list: {
    padding: 16,
    gap: 12,
  },
});
