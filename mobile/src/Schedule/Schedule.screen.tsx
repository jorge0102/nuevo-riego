import React, { useEffect, useCallback, useState } from 'react';
import { useAppTheme } from '../theme/useAppTheme';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAtom, useAtomValue } from 'jotai';
import { sectorsAtom, scheduleService } from './schedule.state';
import { enabledSectorsAtom } from '../Settings/settings.state';
import { getThemeColors, Colors } from '../theme/colors';
import { SectorCard } from './components/SectorCard.component';

export default function ScheduleScreen() {
  const scheme = useAppTheme();
  const theme = getThemeColors(scheme);
  const [sectors, setSectors] = useAtom(sectorsAtom);
  const enabledSectors = useAtomValue(enabledSectorsAtom);
  const visibleSectors = sectors.filter((s) => enabledSectors[s.id] ?? true);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadSectors = useCallback(async () => {
    try {
      setError(false);
      const data = await scheduleService.getSectors();
      setSectors(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [setSectors]);

  // Carga inicial
  useEffect(() => {
    loadSectors();
  }, [loadSectors]);

  // Polling cada 10 segundos para actualizar timers
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await scheduleService.getSectors();
        setSectors(data);
        setError(false);
      } catch {
        // mantener datos actuales en segundo plano
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [setSectors]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSectors();
    setRefreshing(false);
  };

  const handleToggleSector = async (id: number, isActive: boolean) => {
    try {
      await scheduleService.toggleSector(id, isActive);
      setSectors((prev) => prev.map((s) => (s.id === id ? { ...s, isActive } : s)));
      setTimeout(loadSectors, 500);
    } catch (e) {
      console.error('Error al cambiar estado del sector:', e);
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

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1 }} />
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={48} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin conexión</Text>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            No se pudo conectar con la API.{'\n'}Comprueba que el Pi está encendido.
          </Text>
          <TouchableOpacity
            onPress={() => { setLoading(true); loadSectors(); }}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {visibleSectors.map((sector) => (
            <SectorCard
              key={sector.id}
              sector={sector}
              onToggle={handleToggleSector}
            />
          ))}
        </ScrollView>
      )}
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  retryButton: {
    marginTop: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
});
