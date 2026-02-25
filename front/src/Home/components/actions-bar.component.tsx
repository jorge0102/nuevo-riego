
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ActionsBarProps {
  onManualClick: () => void;
  onHistoryClick: () => void;
}

export const ActionsBar: React.FC<ActionsBarProps> = ({
  onManualClick,
  onHistoryClick,
}) => {
  const navigate = useNavigate();

  return (
    <div className="h-full">
      <div className="grid grid-cols-3 gap-2 h-full">
        <div
          onClick={onManualClick}
          className="flex flex-col items-center justify-center gap-1 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-2.5">
            <span className="material-symbols-outlined text-primary text-xl">
              water_drop
            </span>
          </div>
          <p className="text-xs font-medium leading-tight">Manual</p>
        </div>
        <div
          onClick={() => navigate('/schedule')}
          className="flex flex-col items-center justify-center gap-1 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <div className="rounded-full bg-gray-200 dark:bg-gray-700 p-2.5">
            <span className="material-symbols-outlined text-inherit text-xl">
              calendar_month
            </span>
          </div>
          <p className="text-xs font-medium leading-tight">Programa</p>
        </div>
        <div
          onClick={onHistoryClick}
          className="flex flex-col items-center justify-center gap-1 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <div className="rounded-full bg-gray-200 dark:bg-gray-700 p-2.5">
            <span className="material-symbols-outlined text-inherit text-xl">
              bar_chart
            </span>
          </div>
          <p className="text-xs font-medium leading-tight">Historial</p>
        </div>
      </div>
    </div>
  );
};
