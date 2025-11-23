
import React, { useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { isDarkModeAtom, tankStatusAtom, weeklyScheduleAtom } from './home.module';
import { ActionsBar } from './components/actions-bar.component';
import { Header } from './components/header.componet';
import { MainStatusCard } from './components/main-status-card.component';
import { TankLevelCard } from './components/tank-level-card.component';
import { WeeklySchedule } from './components/weekly-schedule.component';
import { homeService } from './home.state';

const Home: React.FC = () => {
  const [tankStatus, setTankStatus] = useAtom(tankStatusAtom);
  const [weeklySchedule, setWeeklySchedule] = useAtom(weeklyScheduleAtom);
  const isDarkMode = useAtomValue(isDarkModeAtom);

  useEffect(() => {
    const loadData = async () => {
      try {
        const tankLevel = await homeService.getTankLevel();
        const wateringStatus = await homeService.getWateringStatus();
        const schedule = await homeService.getWeeklySchedule();

        setTankStatus({
          tankLevel,
          isWatering: wateringStatus.isWatering,
          timeRemaining: wateringStatus.timeRemaining,
        });

        setWeeklySchedule(schedule);
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    };

    loadData();
  }, [setTankStatus, setWeeklySchedule]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const tankLevel = await homeService.getTankLevel();
        setTankStatus((prev) => ({
          ...prev,
          tankLevel,
        }));
      } catch (error) {
        console.error('Error actualizando nivel del tanque:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [setTankStatus]);

  const handleSettingsClick = () => {
    console.log('Configuración clickeada');
  };

  const handlePauseClick = async () => {
    try {
      const action = tankStatus.isWatering ? 'pause' : 'resume';
      await homeService.toggleWatering(action);
      
      setTankStatus((prev) => ({
        ...prev,
        isWatering: !prev.isWatering,
      }));
    } catch (error) {
      console.error('Error al pausar/reanudar:', error);
    }
  };

  const handleManualClick = async () => {
    console.log('Riego manual clickeado');
    try {
      await homeService.startManualWatering(15);
      setTankStatus((prev) => ({
        ...prev,
        isWatering: true,
        timeRemaining: '15:00',
      }));
    } catch (error) {
      console.error('Error iniciando riego manual:', error);
    }
  };

  const handleHistoryClick = () => {
    console.log('Historial clickeado');
  };

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden ${isDarkMode ? 'dark' : ''}`}
      style={{ height: '100vh', maxHeight: '100vh' }}
    >
      <div className="h-full flex flex-col font-display bg-background-light dark:bg-background-dark text-[#101922] dark:text-gray-200 overflow-hidden">
        <div className="flex-shrink-0" style={{ height: '60px' }}>
          <Header title="Jardín Frontal" onSettingsClick={handleSettingsClick} />
        </div>

        <main 
          className="flex-1 flex flex-col gap-3 px-3 py-2 overflow-hidden"
          style={{ minHeight: 0 }}
        >
          <div className="flex-shrink-0" style={{ height: '35%' }}>
            <MainStatusCard
              isWatering={tankStatus.isWatering}
              timeRemaining={tankStatus.timeRemaining}
              onPauseClick={handlePauseClick}
            />
          </div>

          <div className="flex-shrink-0" style={{ height: '80px' }}>
            <ActionsBar
              onManualClick={handleManualClick}
              onHistoryClick={handleHistoryClick}
            />
          </div>

          <div className="flex-shrink-0" style={{ height: '100px' }}>
            <TankLevelCard level={tankStatus.tankLevel} label="Nivel del Estanque" />
          </div>

          <div className="flex-1 overflow-hidden" style={{ minHeight: '120px' }}>
            <WeeklySchedule schedule={weeklySchedule} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
