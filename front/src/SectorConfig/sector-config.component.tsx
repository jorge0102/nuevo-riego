
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { sectorConfigAtom, sectorConfigService, type SectorConfiguration } from './sector-config.module';
import { ConfigHeader } from './components/config-header.component';
import { ModeToggle } from './components/mode-toggle.component';
import { DaysSelector } from './components/days-selector.component';
import { TimeDuration } from './components/time-duration.component';
import { RepeatCycle } from './components/repeat-cycle.component';

const SectorConfig: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [config, setConfig] = useAtom(sectorConfigAtom);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      if (!id) return;
      try {
        setError(false);
        const sectorConfig = await sectorConfigService.getSectorConfig(Number(id));
        setConfig(sectorConfig);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, [id, setConfig]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark">
        <div className="p-4">
          <button onClick={() => navigate('/schedule')} className="text-primary font-semibold text-2xl">←</button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
        <div className="p-4">
          <button onClick={() => navigate('/schedule')} className="text-primary font-semibold text-2xl">←</button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
          <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-5xl">cloud_off</span>
          <p className="text-lg font-bold">Sin conexión</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No se pudo cargar la configuración.<br />Comprueba que el Pi está encendido.
          </p>
          <button
            onClick={() => navigate('/schedule')}
            className="mt-1 px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await sectorConfigService.saveSectorConfig(config);
      navigate('/schedule');
    } catch (error) {
      console.error('Error guardando configuración:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = (updates: Partial<SectorConfiguration>) => {
    setConfig((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden p-4 md:p-6 lg:p-8 bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark">
      <ConfigHeader title={config.name} icon={config.icon} />

      <div className="flex flex-col gap-6">
        <ModeToggle
          isAuto={config.isAuto}
          onChange={(isAuto) => updateConfig({ isAuto })}
        />

        <DaysSelector
          days={config.days}
          onChange={(days) => updateConfig({ days })}
        />

        <TimeDuration
          startTime={config.startTime}
          duration={config.duration}
          onStartTimeChange={(startTime) => updateConfig({ startTime })}
          onDurationChange={(duration) => updateConfig({ duration })}
        />

        <RepeatCycle
          repeatCycle={config.repeatCycle}
          onChange={(repeatCycle) => updateConfig({ repeatCycle })}
        />
      </div>

      <div className="mt-8 flex w-full flex-col sm:flex-row gap-4 sticky bottom-4">
        <button
          onClick={() => navigate('/schedule')}
          className="flex h-14 w-full items-center justify-center rounded-xl border-2 border-primary-dark/20 dark:border-primary/20 bg-transparent px-6 text-base font-bold text-primary-dark dark:text-primary hover:bg-primary/10 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex h-14 w-full items-center justify-center rounded-xl bg-success px-6 text-base font-bold text-white hover:bg-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
};

export default SectorConfig;
