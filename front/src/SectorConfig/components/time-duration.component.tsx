
import React, { useRef } from 'react';

interface TimeDurationProps {
  startTime: string;
  duration: number;
  onStartTimeChange: (time: string) => void;
  onDurationChange: (duration: number) => void;
}

function useHold(action: () => void) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const start = () => {
    action();
    intervalRef.current = setInterval(action, 120);
  };
  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
  return { start, stop };
}

export const TimeDuration: React.FC<TimeDurationProps> = ({
  startTime,
  duration,
  onStartTimeChange,
  onDurationChange,
}) => {
  const [hours, minutes] = startTime.split(':').map(Number);

  const changeMinutes = (delta: number) => {
    let newMinutes = minutes + delta;
    let newHours = hours;
    if (newMinutes >= 60) { newMinutes -= 60; newHours = (newHours + 1) % 24; }
    if (newMinutes < 0)  { newMinutes += 60; newHours = (newHours - 1 + 24) % 24; }
    onStartTimeChange(`${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`);
  };

  const changeHours = (delta: number) => {
    const newHours = (hours + delta + 24) % 24;
    onStartTimeChange(`${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
  };

  const holdHourUp   = useHold(() => changeHours(1));
  const holdHourDown = useHold(() => changeHours(-1));
  const holdMinUp    = useHold(() => changeMinutes(1));
  const holdMinDown  = useHold(() => changeMinutes(-1));
  const holdDurUp    = useHold(() => onDurationChange(Math.min(duration + 1, 180)));
  const holdDurDown  = useHold(() => onDurationChange(Math.max(duration - 1, 1)));

  const btnClass = "flex items-center justify-center rounded-xl bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark hover:bg-primary/20 active:scale-95 transition-all select-none";

  return (
    <div className="flex flex-col rounded-xl bg-card-light dark:bg-card-dark p-4">
      <h3 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-tight pb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary-dark dark:text-primary">schedule</span>
        Horario y Duración
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Hora de inicio */}
        <div className="flex flex-col gap-2 rounded-lg bg-background-light dark:bg-background-dark p-4 items-center">
          <label className="text-sm font-medium text-text-light/80 dark:text-text-dark/80">Hora de Inicio</label>

          <div className="flex items-center gap-3">
            {/* Horas */}
            <div className="flex flex-col items-center gap-1">
              <button
                className={`${btnClass} w-10 h-10`}
                onMouseDown={holdHourUp.start} onMouseUp={holdHourUp.stop} onMouseLeave={holdHourUp.stop}
                onTouchStart={holdHourUp.start} onTouchEnd={holdHourUp.stop}
              >
                <span className="material-symbols-outlined text-xl">expand_less</span>
              </button>
              <span className="text-3xl font-bold w-12 text-center tabular-nums">
                {String(hours).padStart(2, '0')}
              </span>
              <button
                className={`${btnClass} w-10 h-10`}
                onMouseDown={holdHourDown.start} onMouseUp={holdHourDown.stop} onMouseLeave={holdHourDown.stop}
                onTouchStart={holdHourDown.start} onTouchEnd={holdHourDown.stop}
              >
                <span className="material-symbols-outlined text-xl">expand_more</span>
              </button>
            </div>

            <span className="text-3xl font-bold text-text-light/50 dark:text-text-dark/50 mb-0.5">:</span>

            {/* Minutos */}
            <div className="flex flex-col items-center gap-1">
              <button
                className={`${btnClass} w-10 h-10`}
                onMouseDown={holdMinUp.start} onMouseUp={holdMinUp.stop} onMouseLeave={holdMinUp.stop}
                onTouchStart={holdMinUp.start} onTouchEnd={holdMinUp.stop}
              >
                <span className="material-symbols-outlined text-xl">expand_less</span>
              </button>
              <span className="text-3xl font-bold w-12 text-center tabular-nums">
                {String(minutes).padStart(2, '0')}
              </span>
              <button
                className={`${btnClass} w-10 h-10`}
                onMouseDown={holdMinDown.start} onMouseUp={holdMinDown.stop} onMouseLeave={holdMinDown.stop}
                onTouchStart={holdMinDown.start} onTouchEnd={holdMinDown.stop}
              >
                <span className="material-symbols-outlined text-xl">expand_more</span>
              </button>
            </div>
          </div>
        </div>

        {/* Duración */}
        <div className="flex flex-col gap-2 rounded-lg bg-background-light dark:bg-background-dark p-4 items-center">
          <label className="text-sm font-medium text-text-light/80 dark:text-text-dark/80">Duración</label>

          <div className="flex items-center gap-3">
            <button
              className={`${btnClass} w-12 h-12`}
              onMouseDown={holdDurDown.start} onMouseUp={holdDurDown.stop} onMouseLeave={holdDurDown.stop}
              onTouchStart={holdDurDown.start} onTouchEnd={holdDurDown.stop}
              disabled={duration <= 1}
            >
              <span className="material-symbols-outlined text-2xl">remove</span>
            </button>

            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold tabular-nums leading-none">{duration}</span>
              <span className="text-xs text-text-light/60 dark:text-text-dark/60 mt-1">minutos</span>
            </div>

            <button
              className={`${btnClass} w-12 h-12`}
              onMouseDown={holdDurUp.start} onMouseUp={holdDurUp.stop} onMouseLeave={holdDurUp.stop}
              onTouchStart={holdDurUp.start} onTouchEnd={holdDurUp.stop}
              disabled={duration >= 180}
            >
              <span className="material-symbols-outlined text-2xl">add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
