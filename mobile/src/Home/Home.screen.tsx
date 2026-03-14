import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, useColorScheme,
  ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAtom } from 'jotai';
import { tankStatusAtom, weeklyScheduleAtom, homeService } from './home.state';
import { resetApiUrl } from '../config/api';
import { getThemeColors, Colors } from '../theme/colors';
import { Header } from './components/Header.component';
import { MainStatusCard } from './components/MainStatusCard.component';
import { ActionsBar } from './components/ActionsBar.component';
import { TankLevelCard } from './components/TankLevelCard.component';
import { ManualWateringModal } from './components/ManualWateringModal.component';
import { WeeklySchedule } from './components/WeeklySchedule.component';

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme);
  const [tankStatus, setTankStatus] = useAtom(tankStatusAtom);
  const [weeklySchedule, setWeeklySchedule] = useAtom(weeklyScheduleAtom);
  const [showManualModal, setShowManualModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadInitialData = async () => {
    try {
      setError(false);
      const [wateringStatus, tankLevel, schedule] = await Promise.all([
        homeService.getWateringStatus(),
        homeService.getTankLevel(),
        homeService.getWeeklySchedule(),
      ]);
      setTankStatus({ ...wateringStatus, tankLevel });
      setWeeklySchedule(schedule);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    loadInitialData();
  }, []);

  // Polling cada 5 segundos: nivel tanque + estado riego
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [wateringStatus, tankLevel] = await Promise.all([
          homeService.getWateringStatus(),
          homeService.getTankLevel(),
        ]);
        setTankStatus({ ...wateringStatus, tankLevel });
        setError(false);
      } catch {
        // no sobreescribir error si ya está en error state
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [setTankStatus]);

  const handleStartManual = async (duration: number) => {
    try {
      await homeService.startManualWatering(duration);
      const mins = String(duration).padStart(2, '0');
      setTankStatus((prev) => ({ ...prev, isWatering: true, timeRemaining: `${mins}:00` }));
    } catch (e) {
      console.error('Error iniciando riego manual:', e);
      throw e;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { height: 60 }]}>
          <Header title="Finca Eloy" onSettingsClick={() => {}} />
        </View>
        <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={{ height: 60 }}>
          <Header title="Finca Eloy" onSettingsClick={() => {}} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={52} color={theme.textMuted} />
          <Text style={[styles.errorTitle, { color: theme.text }]}>Sin conexión</Text>
          <Text style={[styles.errorText, { color: theme.textMuted }]}>
            No se pudo conectar con la API.{'\n'}Comprueba que el Pi está encendido.
          </Text>
          <TouchableOpacity
            onPress={() => { resetApiUrl(); setLoading(true); loadInitialData(); }}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={{ height: 60 }}>
          <Header title="Finca Eloy" onSettingsClick={() => {}} />
        </View>
        <View style={styles.main}>
          <View style={styles.statusCard}>
            <MainStatusCard
              isWatering={tankStatus.isWatering}
              sectorName={tankStatus.sectorName}
              timeRemaining={tankStatus.timeRemaining}
            />
          </View>
          <View style={{ height: 90 }}>
            <ActionsBar
              onManualClick={() => setShowManualModal(true)}
              onHistoryClick={() => router.push('/history')}
            />
          </View>
          <View style={{ height: 100 }}>
            <TankLevelCard level={tankStatus.tankLevel} label="Nivel del Estanque" />
          </View>
          {weeklySchedule.length > 0 && (
            <WeeklySchedule schedule={weeklySchedule} />
          )}
        </View>
      </View>

      <ManualWateringModal
        visible={showManualModal}
        onClose={() => setShowManualModal(false)}
        onStart={handleStartManual}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  main: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
  },
  statusCard: { flex: 1, minHeight: 180 },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});
