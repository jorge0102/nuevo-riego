
import React, { useEffect, useCallback, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { sectorsAtom, scheduleService, type Sector } from './schedule.module';
import { ScheduleHeader } from './components/schedule-header.component';
import { SectorCard } from './components/sector-card.component';
import { resetApiUrl } from '../config/api';
import { enabledSectorsAtom } from '../Settings/settings.state';

const Schedule: React.FC = () => {
  const [sectors, setSectors] = useAtom(sectorsAtom);
  const enabledSectors = useAtomValue(enabledSectorsAtom);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [conflict, setConflict] = useState<{ activeSector: Sector; newId: number } | null>(null);
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

  const doToggle = async (id: number, isActive: boolean) => {
    try {
      await scheduleService.toggleSector(id, isActive);
      setSectors((prev) => prev.map((s) => {
        if (s.id === id) return { ...s, isActive };
        if (isActive && s.isActive) return { ...s, isActive: false }; // refleja parada de otros
        return s;
      }));
      setTimeout(loadSectors, 500);
    } catch (error) {
      console.error('Error al cambiar estado del sector:', error);
    }
  };

  const handleToggleSector = (id: number, isActive: boolean) => {
    if (isActive) {
      const activeSector = sectors.find((s) => s.isActive && s.id !== id);
      if (activeSector) {
        setConflict({ activeSector, newId: id });
        return;
      }
    }
    doToggle(id, isActive);
  };

  const handleConflictConfirm = async () => {
    if (!conflict) return;
    setConflict(null);
    await doToggle(conflict.newId, true);
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
        <ScheduleHeader title="Volver Menú" />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
        <ScheduleHeader title="Volver Menú" />
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
      <ScheduleHeader title="Volver Menú" />

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

      {/* Modal conflicto electroválvula */}
      {conflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConflict(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-sm w-full flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-orange-500 text-2xl">warning</span>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100">Electroválvula activa</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Solo puede haber 1 abierta a la vez</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <span className="font-semibold text-orange-500">
                {sectors.find(s => s.id === conflict.activeSector.id)?.name ?? conflict.activeSector.name}
              </span>{' '}
              está activo. ¿Quieres pararlo y activar{' '}
              <span className="font-semibold text-primary">
                {sectors.find(s => s.id === conflict.newId)?.name ?? 'el nuevo sector'}
              </span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConflict(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConflictConfirm}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Sí, cambiar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
