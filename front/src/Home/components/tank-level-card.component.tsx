
import React from 'react';

interface TankLevelCardProps {
  level: number;
  label?: string;
}

export const TankLevelCard: React.FC<TankLevelCardProps> = ({
  level,
  label = 'Nivel del Estanque',
}) => {
  const getStatusText = (level: number): string => {
    if (level >= 70) return 'Nivel óptimo';
    if (level >= 40) return 'Nivel medio';
    return 'Nivel bajo';
  };

  const getStatusColor = (level: number): string => {
    if (level >= 70) return 'text-green-600 dark:text-green-400';
    if (level >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="h-full flex flex-col justify-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="flex gap-4 justify-between items-center">
        <p className="text-sm font-medium leading-tight">{label}</p>
        <p className="text-base font-bold leading-tight text-primary">{level}%</p>
      </div>
      <div className="rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-1.5 rounded-full bg-primary transition-all duration-500"
          style={{ width: `${level}%` }}
        />
      </div>
      <p className={`text-xs font-normal leading-tight ${getStatusColor(level)}`}>
        {getStatusText(level)}
      </p>
    </div>
  );
};
