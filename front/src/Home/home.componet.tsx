
import React, { useEffect, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { tankStatusAtom, weeklyScheduleAtom } from './home.module';
import { ActionsBar } from './components/actions-bar.component';
import { Header } from './components/header.componet';
import { MainStatusCard } from './components/main-status-card.component';
import { TankLevelCard } from './components/tank-level-card.component';
import { WeeklySchedule } from './components/weekly-schedule.component';
import { ManualWateringModal } from './components/manual-watering-modal.component';
import { homeService } from './home.state';
import { resetApiUrl } from '../config/api';
import { appNameAtom, sectorNamesAtom, enabledSectorsAtom } from '../Settings/settings.state';
import { sectorsAtom } from '../Schedule/schedule.module';

const FALLBACK_NAMES: Record<number, string> = {
  1: 'Sector 1: Aguacates',
  2: 'Sector 2: Mangos',
  3: 'Sector 3: Pencas',
  4: 'Sector 4: Pitayas',
};

const Home: React.FC = () => {
  const [tankStatus, setTankStatus] = useAtom(tankStatusAtom);
  const [weeklySchedule, setWeeklySchedule] = useAtom(weeklyScheduleAtom);
  const appName = useAtomValue(appNameAtom);
  const sectorNames = useAtomValue(sectorNamesAtom);
  const enabledSectors = useAtomValue(enabledSectorsAtom);
  const allSectors = useAtomValue(sectorsAtom);

  const sectorOptions = allSectors.length > 0
    ? allSectors
        .filter((s) => enabledSectors[s.id] ?? true)
        .map((s) => ({ id: s.id, name: sectorNames[s.id] ?? s.name }))
    : [1, 2, 3, 4]
        .filter((id) => enabledSectors[id] ?? true)
        .map((id) => ({ id, name: sectorNames[id] ?? FALLBACK_NAMES[id] ?? `Sector ${id}` }));

  const activeSectorCount = allSectors.filter((s) => s.isActive).length;
  const [showManualModal, setShowManualModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const resolvedSectorName =
    tankStatus.sectorId != null && sectorNames[tankStatus.sectorId]
      ? sectorNames[tankStatus.sectorId]
      : tankStatus.sectorName;

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
        // mantener datos actuales en segundo plano
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

  const handleStartManual = async (sectorId: number, duration: number) => {
    try {
      await homeService.startManualWatering(sectorId, duration);
      const mins = String(duration).padStart(2, '0');
      setTankStatus((prev) => ({ ...prev, isWatering: true, timeRemaining: `${mins}:00` }));
    } catch (e) {
      console.error('Error iniciando riego manual:', e);
      throw e;
    }
  };

  const handleHistoryClick = () => {
    console.log('Historial clickeado');
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <div className="h-full flex flex-col font-display bg-background-light dark:bg-background-dark overflow-hidden">
          <div className="flex-shrink-0" style={{ height: '60px' }}>
            <Header title={appName} />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <div className="h-full flex flex-col font-display bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 overflow-hidden">
          <div className="flex-shrink-0" style={{ height: '60px' }}>
            <Header title={appName} />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-5xl">cloud_off</span>
            <p className="text-lg font-bold">Sin conexión</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No se pudo conectar con la API.<br />Comprueba que el Pi está encendido.
            </p>
            <button
              onClick={() => { resetApiUrl(); setLoading(true); loadInitialData(); }}
              className="mt-1 px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ height: '100vh', maxHeight: '100vh' }}
    >
      <div className="h-full flex flex-col font-display bg-background-light dark:bg-background-dark text-[#101922] dark:text-gray-200 overflow-hidden">
        <div className="flex-shrink-0" style={{ height: '60px' }}>
          <Header title={appName} />
        </div>

        <main
          className="flex-1 flex flex-col gap-3 px-3 py-2 overflow-hidden"
          style={{ minHeight: 0 }}
        >
          <div className="flex-shrink-0" style={{ height: '35%' }}>
            <MainStatusCard
              isWatering={tankStatus.isWatering}
              sectorName={resolvedSectorName}
              timeRemaining={tankStatus.timeRemaining}
              onPauseClick={handlePauseClick}
            />
          </div>

          <div className="flex-shrink-0" style={{ height: '80px' }}>
            <ActionsBar
              onManualClick={() => setShowManualModal(true)}
              onHistoryClick={handleHistoryClick}
            />
          </div>

          <div className="flex-shrink-0" style={{ height: '100px' }}>
            <TankLevelCard level={tankStatus.tankLevel} label="Nivel del Estanque" />
          </div>

          {weeklySchedule.length > 0 && (
            <div className="flex-shrink-0">
              <WeeklySchedule schedule={weeklySchedule} />
            </div>
          )}
        </main>
      </div>

      <ManualWateringModal
        visible={showManualModal}
        onClose={() => setShowManualModal(false)}
        onStart={handleStartManual}
        sectors={sectorOptions}
        activeSectorCount={activeSectorCount}
      />
    </div>
  );
};

export default Home;
