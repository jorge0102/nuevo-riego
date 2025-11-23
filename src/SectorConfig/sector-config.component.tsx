
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

  useEffect(() => {
    const loadConfig = async () => {
      if (!id) return;
      
      try {
        const sectorConfig = await sectorConfigService.getSectorConfig(Number(id));
        setConfig(sectorConfig);
      } catch (error) {
        console.error('Error cargando configuración:', error);
      }
    };

    loadConfig();
  }, [id, setConfig]);

  if (!config) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-light dark:bg-background-dark">
        <p className="text-text-light dark:text-text-dark">Cargando...</p>
      </div>
    );
  }

  const handleSave = async () => {
    if (!config) return;
    
    setIsSaving(true);
    try {
      await sectorConfigService.saveSectorConfig(config);
      console.log('✓ Configuración guardada correctamente');
      navigate('/schedule');
    } catch (error) {
      console.error('Error guardando configuración:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/schedule');
  };

  const updateConfig = (updates: Partial<SectorConfiguration>) => {
    setConfig(prev => prev ? { ...prev, ...updates } : null);
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
          onClick={handleCancel}
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
