import React, { useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, useColorScheme, RefreshControl,
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
  const [refreshing, setRefreshing] = React.useState(false);

  const loadSectors = useCallback(async () => {
    try {
      const data = await scheduleService.getSectors();
      setSectors(data);
    } catch (error) {
      console.error('Error cargando sectores:', error);
    }
  }, [setSectors]);

  // Carga inicial
  useEffect(() => {
    loadSectors();
  }, [loadSectors]);

  // Polling cada 10 segundos para actualizar timers
  useEffect(() => {
    const interval = setInterval(loadSectors, 10000);
    return () => clearInterval(interval);
  }, [loadSectors]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSectors();
    setRefreshing(false);
  };

  const handleToggleSector = async (id: number, isActive: boolean) => {
    try {
      await scheduleService.toggleSector(id, isActive);
      // Actualiza localmente y luego recarga para coger el timer
      setSectors((prev) => prev.map((s) => (s.id === id ? { ...s, isActive } : s)));
      setTimeout(loadSectors, 500);
    } catch (error) {
      console.error('Error al cambiar estado del sector:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    width: 48, height: 48,
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 28, fontWeight: '600' },
  title: { flex: 1, fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  headerRight: { width: 48 },
  list: { padding: 16, gap: 12 },
});
