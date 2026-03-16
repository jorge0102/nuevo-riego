
import React, { useEffect, useCallback, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { sectorsAtom, scheduleService } from './schedule.module';
import { ScheduleHeader } from './components/schedule-header.component';
import { SectorCard } from './components/sector-card.component';
import { resetApiUrl } from '../config/api';
import { enabledSectorsAtom } from '../Settings/settings.state';

const Schedule: React.FC = () => {
  const [sectors, setSectors] = useAtom(sectorsAtom);
  const enabledSectors = useAtomValue(enabledSectorsAtom);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const visibleSectors = sectors.filter((s) => enabledSectors[s.id] ?? true);

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

  // Polling cada 10 segundos
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

  const handleToggleSector = async (id: number, isActive: boolean) => {
    try {
      await scheduleService.toggleSector(id, isActive);
      setSectors((prev) => prev.map((s) => (s.id === id ? { ...s, isActive } : s)));
      setTimeout(loadSectors, 500);
    } catch (error) {
      console.error('Error al cambiar estado del sector:', error);
    }
  };

  const handleModeChange = async (id: number, isAuto: boolean) => {
    try {
      await scheduleService.toggleMode(id, isAuto);
      setSectors((prev) => prev.map((s) => (s.id === id ? { ...s, isAuto } : s)));
    } catch (error) {
      console.error('Error al cambiar modo del sector:', error);
    }
  };

  if (loading) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
        <ScheduleHeader title="Volver Menú" onSettingsClick={() => {}} />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
        <ScheduleHeader title="Volver Menú" onSettingsClick={() => {}} />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center py-20">
          <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-5xl">cloud_off</span>
          <p className="text-lg font-bold">Sin conexión</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No se pudo conectar con la API.<br />Comprueba que el Pi está encendido.
          </p>
          <button
            onClick={() => { resetApiUrl(); setLoading(true); loadSectors(); }}
            className="mt-1 px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      <ScheduleHeader title="Volver Menú" onSettingsClick={() => {}} />

      <main className="flex-grow p-4 pt-2">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {visibleSectors.map((sector) => (
            <SectorCard
              key={sector.id}
              sector={sector}
              onToggle={handleToggleSector}
              onModeChange={handleModeChange}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Schedule;
