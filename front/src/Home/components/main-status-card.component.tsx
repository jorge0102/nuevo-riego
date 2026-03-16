
import React from 'react';

interface MainStatusCardProps {
  isWatering: boolean;
  sectorName: string | null;
  timeRemaining: string;
  onPauseClick: () => void;
}

export const MainStatusCard: React.FC<MainStatusCardProps> = ({
  isWatering,
  sectorName,
  timeRemaining,
  onPauseClick,
}) => {
  return (
    <div className="h-full p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex flex-col">
      <div className="flex-1 flex items-center gap-2">
        <div
          className="w-1/2 h-full bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0"
          style={{
            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCX-qI75F7I9Fa-okePuaRZ_0QHhGei-f3Kk8P1erR5GRHqZC-LctGboERU9Uo5ZkBT2HjHr4D5XU5GYmeQeV3KxlfJXgW1aF-hAuIbwTBoJBKJ273-ljPBj_CaLUZGZttHest-7vvFgZ5mx9SeNGv7n5rglJcAMtyC8KtX8IiIYZWdIZwLuC7h94t2oNNf-oW1RMn4BPkyYcH0_YPald_oLorEMndY5rNZ7Ckj-5DKABj_uWCDOmm50gYoPWAekVQus5h12NuLr8SW")`,
          }}
        />

        <div className="flex-1 flex flex-col justify-center gap-2">
          <span
            className={`self-start px-2.5 py-1 rounded-full text-xs font-bold ${
              isWatering
                ? 'bg-primary/10 text-primary'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}
          >
            {isWatering ? 'Regando' : 'Inactivo'}
          </span>

          {isWatering ? (
            <>
              <p className="text-sm font-bold leading-tight truncate text-gray-900 dark:text-gray-100">
                {sectorName ?? 'Sector'}
              </p>
              <div className="flex flex-col gap-0.5">
                <p className="text-gray-500 dark:text-gray-400 text-xs leading-tight">
                  Tiempo restante
                </p>
                <p className="text-primary text-xl font-bold leading-tight">
                  {timeRemaining}
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-tight">
              Sin riego activo
            </p>
          )}

          <button
            onClick={onPauseClick}
            className="flex items-center justify-center rounded-lg h-8 px-3 bg-primary text-white text-xs font-medium leading-normal gap-1.5 hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-base">
              {isWatering ? 'pause' : 'play_arrow'}
            </span>
            <span className="truncate">{isWatering ? 'Pausa' : 'Reanudar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
