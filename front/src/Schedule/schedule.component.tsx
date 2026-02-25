
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

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      <ScheduleHeader title="Volver Menú" onSettingsClick={handleSettingsClick} />

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
    </div>
  );
};

export default Schedule;
