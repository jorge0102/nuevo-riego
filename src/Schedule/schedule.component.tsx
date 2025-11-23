
import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { tankLevelAtom, sectorsAtom, scheduleService } from './schedule.module';
import { ScheduleHeader } from './components/schedule-header.component';
import { SectorCard } from './components/sector-card.component';

const Schedule: React.FC = () => {
  const [, setTankLevel] = useAtom(tankLevelAtom);
  const [sectors, setSectors] = useAtom(sectorsAtom);

  useEffect(() => {
    const loadData = async () => {
      try {
        const level = await scheduleService.getTankLevel();
        const sectorsData = await scheduleService.getSectors();
        
        setTankLevel(level);
        setSectors(sectorsData);
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    };

    loadData();
  }, [setTankLevel, setSectors]);

  const handleSettingsClick = () => {
    console.log('Configuración clickeada');
  };

  const handleToggleSector = async (id: number, isActive: boolean) => {
    try {
      await scheduleService.toggleSector(id, isActive);
      
      setSectors(prevSectors =>
        prevSectors.map(sector =>
          sector.id === id ? { ...sector, isActive } : sector
        )
      );
    } catch (error) {
      console.error('Error al cambiar estado del sector:', error);
    }
  };

  const handleModeChange = async (id: number, isAuto: boolean) => {
    try {
      await scheduleService.toggleMode(id, isAuto);
      
      setSectors(prevSectors =>
        prevSectors.map(sector =>
          sector.id === id ? { ...sector, isAuto } : sector
        )
      );
    } catch (error) {
      console.error('Error al cambiar modo del sector:', error);
    }
  };

  const handleEditSchedules = () => {
    console.log('Edit Schedules clickeado');
    // Aquí podrías abrir un modal o navegar a otra página
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      <ScheduleHeader title="Smart Irrigation" onSettingsClick={handleSettingsClick} />
      
      <main className="flex-grow p-4 pt-2">
        
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {sectors.map(sector => (
            <SectorCard
              key={sector.id}
              sector={sector}
              onToggle={handleToggleSector}
              onModeChange={handleModeChange}
            />
          ))}
        </div>
      </main>
      
      {/* Floating Action Button */}
      <div className="sticky bottom-0 w-full p-4 flex justify-center">
        <button 
          onClick={handleEditSchedules}
          className="flex items-center justify-center gap-3 h-14 w-full max-w-sm rounded-full bg-primary text-white font-bold text-lg shadow-lg hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined">edit_calendar</span>
          Edit Schedules
        </button>
      </div>
    </div>
  );
};

export default Schedule;
