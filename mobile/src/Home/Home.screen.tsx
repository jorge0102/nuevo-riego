import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, useColorScheme } from 'react-native';
import { useAtom } from 'jotai';
import { tankStatusAtom, homeService } from './home.state';
import { getThemeColors } from '../theme/colors';
import { Header } from './components/Header.component';
import { MainStatusCard } from './components/MainStatusCard.component';
import { ActionsBar } from './components/ActionsBar.component';
import { TankLevelCard } from './components/TankLevelCard.component';

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme);
  const [tankStatus, setTankStatus] = useAtom(tankStatusAtom);

  // Carga inicial: estado de riego + nivel de tanque
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [wateringStatus, tankLevel] = await Promise.all([
          homeService.getWateringStatus(),
          homeService.getTankLevel(),
        ]);
        setTankStatus({ ...wateringStatus, tankLevel });
      } catch (error) {
        console.error('Error cargando estado inicial:', error);
      }
    };
    loadInitialData();
  }, [setTankStatus]);

  // Polling cada 5 segundos: nivel tanque + estado riego
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [wateringStatus, tankLevel] = await Promise.all([
          homeService.getWateringStatus(),
          homeService.getTankLevel(),
        ]);
        setTankStatus({ ...wateringStatus, tankLevel });
      } catch (error) {
        console.error('Error actualizando estado:', error);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [setTankStatus]);

  const handlePauseClick = async () => {
    try {
      const action = tankStatus.isWatering ? 'pause' : 'resume';
      await homeService.toggleWatering(action);
      setTankStatus((prev) => ({ ...prev, isWatering: !prev.isWatering }));
    } catch (error) {
      console.error('Error al pausar/reanudar:', error);
    }
  };

  const handleManualClick = async () => {
    try {
      await homeService.startManualWatering(15);
      setTankStatus((prev) => ({ ...prev, isWatering: true, timeRemaining: '00:15' }));
    } catch (error) {
      console.error('Error iniciando riego manual:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Header title=Finca Eloy onSettingsClick={() => {}} />
        </View>
        <View style={styles.main}>
          <View style={styles.statusCard}>
            <MainStatusCard
              isWatering={tankStatus.isWatering}
              timeRemaining={tankStatus.timeRemaining}
              onPauseClick={handlePauseClick}
            />
          </View>
          <View style={styles.actionsBar}>
            <ActionsBar onManualClick={handleManualClick} onHistoryClick={() => {}} />
          </View>
          <View style={styles.tankCard}>
            <TankLevelCard level={tankStatus.tankLevel} label=Nivel del Estanque />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  header: { height: 60 },
  main: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
  },
  statusCard: { flex: 4 },
  actionsBar: { height: 90 },
  tankCard: { height: 100 },
});
