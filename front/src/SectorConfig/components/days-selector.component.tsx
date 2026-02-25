
import React from 'react';
import type { DayConfig } from '../sector-config.mocks';

interface DaysSelectorProps {
  days: DayConfig[];
  onChange: (days: DayConfig[]) => void;
}

export const DaysSelector: React.FC<DaysSelectorProps> = ({ days, onChange }) => {
  const toggleDay = (index: number) => {
    const newDays = [...days];
    newDays[index].active = !newDays[index].active;
    onChange(newDays);
  };

  return (
    <div className="flex flex-col rounded-xl bg-card-light dark:bg-card-dark p-4">
      <h3 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-tight pb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary-dark dark:text-primary">
          calendar_month
        </span>
        Días de Riego
      </h3>
      <div className="flex gap-2 sm:gap-3 flex-wrap justify-center">
        {days.map((day, index) => (
          <button
            key={day.day}
            onClick={() => toggleDay(index)}
            className={`flex size-12 flex-grow shrink-0 basis-10 items-center justify-center gap-x-2 rounded-xl transition-all ${
              day.active
                ? 'bg-primary text-primary-dark dark:text-background-dark'
                : 'bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark'
            }`}
          >
            <p className="text-base font-medium leading-normal">{day.day}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
