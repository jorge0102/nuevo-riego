
import React from 'react';

interface WeeklyScheduleProps {
  schedule: Array<{ day: string; hasWatering: boolean }>;
}

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({ schedule }) => {
  return (
    <div className="h-full flex flex-col gap-2">
      <h2 className="text-sm font-bold leading-tight tracking-[-0.015em]">
        Programa Semanal
      </h2>
      <div className="grid grid-cols-7 gap-2 text-center">
        {schedule.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {item.day}
            </p>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                item.hasWatering
                  ? 'bg-primary/20 dark:bg-primary/30'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              {item.hasWatering && (
                <span className="material-symbols-outlined text-primary text-base">
                  water_drop
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
