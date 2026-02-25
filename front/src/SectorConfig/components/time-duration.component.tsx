
import React from 'react';

interface TimeDurationProps {
  startTime: string;
  duration: number;
  onStartTimeChange: (time: string) => void;
  onDurationChange: (duration: number) => void;
}

export const TimeDuration: React.FC<TimeDurationProps> = ({
  startTime,
  duration,
  onStartTimeChange,
  onDurationChange,
}) => {
  const incrementTime = () => {
    const [hours, minutes] = startTime.split(':').map(Number);
    let newMinutes = minutes + 15;
    let newHours = hours;
    if (newMinutes >= 60) {
      newMinutes = 0;
      newHours = (newHours + 1) % 24;
    }
    onStartTimeChange(`${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`);
  };

  const decrementTime = () => {
    const [hours, minutes] = startTime.split(':').map(Number);
    let newMinutes = minutes - 15;
    let newHours = hours;
    if (newMinutes < 0) {
      newMinutes = 45;
      newHours = (newHours - 1 + 24) % 24;
    }
    onStartTimeChange(`${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`);
  };

  const incrementDuration = () => {
    onDurationChange(Math.min(duration + 5, 180));
  };

  const decrementDuration = () => {
    onDurationChange(Math.max(duration - 5, 5));
  };

  return (
    <div className="flex flex-col rounded-xl bg-card-light dark:bg-card-dark p-4">
      <h3 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-tight pb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary-dark dark:text-primary">
          schedule
        </span>
        Horario y Duración
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 rounded-lg bg-background-light dark:bg-background-dark p-4 items-center">
          <label className="text-sm font-medium text-text-light/80 dark:text-text-dark/80">
            Hora de Inicio
          </label>
          <div className="flex items-center gap-2">
            <button 
              onClick={decrementTime}
              className="flex size-10 items-center justify-center rounded-full bg-white dark:bg-card-dark/50 text-text-light dark:text-text-dark hover:bg-primary/20 transition-colors"
            >
              -
            </button>
            <span className="text-4xl font-bold text-text-light dark:text-text-dark tracking-tight w-28 text-center">
              {startTime}
            </span>
            <button 
              onClick={incrementTime}
              className="flex size-10 items-center justify-center rounded-full bg-white dark:bg-card-dark/50 text-text-light dark:text-text-dark hover:bg-primary/20 transition-colors"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-lg bg-background-light dark:bg-background-dark p-4 items-center">
          <label className="text-sm font-medium text-text-light/80 dark:text-text-dark/80">
            Duración
          </label>
          <div className="flex items-center gap-2">
            <button 
              onClick={decrementDuration}
              className="flex size-10 items-center justify-center rounded-full bg-white dark:bg-card-dark/50 text-text-light dark:text-text-dark hover:bg-primary/20 transition-colors"
            >
              -
            </button>
            <span className="text-4xl font-bold text-text-light dark:text-text-dark tracking-tight w-28 text-center">
              {duration}<span className="text-lg ml-1">min</span>
            </span>
            <button 
              onClick={incrementDuration}
              className="flex size-10 items-center justify-center rounded-full bg-white dark:bg-card-dark/50 text-text-light dark:text-text-dark hover:bg-primary/20 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
