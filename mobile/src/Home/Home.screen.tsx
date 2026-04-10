import React, { useEffect, useRef, useState } from 'react';
import { useAppTheme } from '../theme/useAppTheme';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAtom, useAtomValue } from 'jotai';
import { tankStatusAtom, sectorSchedulesAtom, homeService, formatSeconds } from './home.state';
import { sectorsAtom, scheduleService } from '../Schedule/schedule.state';
import { appNameAtom, sectorNamesAtom, enabledSectorsAtom } from '../Settings/settings.state';
import { resetApiUrl } from '../config/api';
import { getThemeColors, Colors } from '../theme/colors';
import { Header } from './components/Header.component';
import { MainStatusCard } from './components/MainStatusCard.component';
import { ActionsBar } from './components/ActionsBar.component';
import { TankLevelCard } from './components/TankLevelCard.component';
import { ManualWateringModal } from './components/ManualWateringModal.component';
import { WeeklySchedule } from './components/WeeklySchedule.component';

export default function HomeScreen() {
  const scheme = useAppTheme();
  const theme = getThemeColors(scheme);
  const [tankStatus, setTankStatus] = useAtom(tankStatusAtom);
  const [sectorSchedules, setSectorSchedules] = useAtom(sectorSchedulesAtom);
  const [allSectors, setAllSectors] = useAtom(sectorsAtom);
  const [showManualModal, setShowManualModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [localSeconds, setLocalSeconds] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const appName = useAtomValue(appNameAtom);
  const sectorNames = useAtomValue(sectorNamesAtom);
  const enabledSectors = useAtomValue(enabledSectorsAtom);
  const visibleSectors = allSectors.filter((s) => enabledSectors[s.id] ?? true);
  const activeSectorCount = visibleSectors.filter((s) => s.isActive).length;
  const sectorOptions = visibleSectors.map((s) => ({ id: s.id, name: sectorNames[s.id] ?? s.name }));

  const loadInitialData = async () => {
    try {
      setError(false);
      const [wateringStatus, tankLevel, schedules, sectors] = await Promise.all([
        homeService.getWateringStatus(),
        homeService.getTankLevel(),
        homeService.getSectorSchedules(),
        scheduleService.getSectors(),
      ]);
      setTankStatus({ ...wateringStatus, tankLevel });
      setSectorSchedules(schedules);
      setAllSectors(sectors);
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

  // Sincronizar segundos desde API
  useEffect(() => {
    if (tankStatus.isWatering && tankStatus.remainingSeconds > 0) {
      setLocalSeconds(tankStatus.remainingSeconds);
    } else {
      setLocalSeconds(0);
    }
  }, [tankStatus.remainingSeconds, tankStatus.isWatering]);

  // Countdown local de 1 segundo
  useEffect(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (tankStatus.isWatering && localSeconds > 0) {
      countdownRef.current = setInterval(() => {
        setLocalSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [tankStatus.isWatering, tankStatus.remainingSeconds]);

  // Polling cada 5 segundos: nivel tanque + estado riego + sectores
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [wateringStatus, tankLevel, sectors] = await Promise.all([
          homeService.getWateringStatus(),
          homeService.getTankLevel(),
          scheduleService.getSectors(),
        ]);
        setTankStatus({ ...wateringStatus, tankLevel });
        setAllSectors(sectors);
        setError(false);
      } catch {
        // no sobreescribir error si ya está en error state
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [setTankStatus, setAllSectors]);

  const handleStartManual = async (sectorId: number, duration: number) => {
    try {
      await homeService.startManualWatering(sectorId, duration);
      const totalSeconds = duration * 60;
      setTankStatus((prev) => ({
        ...prev,
        isWatering: true,
        remainingSeconds: totalSeconds,
        timeRemaining: formatSeconds(totalSeconds),
      }));
    } catch (e) {
      console.error('Error iniciando riego manual:', e);
      throw e;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { height: 60 }]}>
          <Header title="Finca Eloy" onSettingsClick={() => router.push('/settings')} title={appName} />
        </View>
        <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={{ height: 60 }}>
          <Header title="Finca Eloy" onSettingsClick={() => router.push('/settings')} title={appName} />
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
          <Header title="Finca Eloy" onSettingsClick={() => router.push('/settings')} title={appName} />
        </View>
        <ScrollView
          contentContainerStyle={styles.main}
          showsVerticalScrollIndicator={false}
        >
          <MainStatusCard
            isWatering={tankStatus.isWatering}
            sectorName={tankStatus.sectorName}
            timeRemaining={formatSeconds(localSeconds)}
          />
          <ActionsBar
            onManualClick={() => setShowManualModal(true)}
            onHistoryClick={() => router.push('/history')}
          />
          <TankLevelCard level={tankStatus.tankLevel} label="Nivel del Estanque" />
          {sectorSchedules.length > 0 && (
            <WeeklySchedule sectors={sectorSchedules} />
          )}
        </ScrollView>
      </View>

      <ManualWateringModal
        visible={showManualModal}
        onClose={() => setShowManualModal(false)}
        onStart={handleStartManual}
        sectors={sectorOptions}
        activeSectorCount={activeSectorCount}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  main: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
    paddingBottom: 24,
  },
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
