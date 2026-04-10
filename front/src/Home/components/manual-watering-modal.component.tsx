import React, { useState, useRef } from 'react';

const MAX_ACTIVE = 1;
const MIN_DURATION = 1;
const MAX_DURATION = 120;
const QUICK_PRESETS = [2, 5, 10, 15, 30, 45, 60];

export interface SectorOption {
  id: number;
  name: string;
}

interface ManualWateringModalProps {
  visible: boolean;
  onClose: () => void;
  onStart: (sectorId: number, duration: number) => Promise<void>;
  sectors: SectorOption[];
  activeSectorCount: number;
}

export const ManualWateringModal: React.FC<ManualWateringModalProps> = ({
  visible,
  onClose,
  onStart,
  sectors,
  activeSectorCount,
}) => {
  const [selectedSectorId, setSelectedSectorId] = useState<number | null>(null);
  const [duration, setDuration] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  if (!visible) return null;

  const wouldExceedLimit = activeSectorCount >= MAX_ACTIVE;
  const canStart = selectedSectorId !== null && !wouldExceedLimit;

  const changeDuration = (delta: number) => {
    setDuration((prev) => Math.min(MAX_DURATION, Math.max(MIN_DURATION, prev + delta)));
  };

  // Pulsación larga: acelera el cambio
  const startHold = (delta: number) => {
    changeDuration(delta);
    intervalRef.current = setInterval(() => changeDuration(delta), 120);
  };
  const stopHold = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleStart = async () => {
    if (!canStart || selectedSectorId === null) return;
    setIsLoading(true);
    try {
      await onStart(selectedSectorId, duration);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-800 rounded-t-2xl px-5 pb-9 pt-3 flex flex-col gap-4">
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600 mx-auto mb-1" />

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-2xl">water_drop</span>
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-gray-900 dark:text-gray-100">Riego Manual</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Selecciona sector y duración</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Aviso límite transformador */}
        {wouldExceedLimit && (
          <div className="flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3">
            <span className="material-symbols-outlined text-red-500 text-xl flex-shrink-0 mt-0.5">warning</span>
            <div>
              <p className="text-sm font-bold text-red-700 dark:text-red-400">Límite de seguridad alcanzado</p>
              <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">
                Solo puede haber 1 electroválvula abierta a la vez. Para el sector activo antes de arrancar otro.
              </p>
            </div>
          </div>
        )}

        {/* Sector */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Sector</p>
          <div className="flex flex-col gap-2">
            {sectors.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">No hay sectores disponibles</p>
            ) : (
              sectors.map((s) => {
                const isSelected = selectedSectorId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSectorId(s.id)}
                    disabled={wouldExceedLimit}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      isSelected
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-lg ${isSelected ? 'text-white' : 'text-primary'}`}>yard</span>
                    {s.name}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Duración — stepper */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">Duración</p>

          {/* Rueda / stepper */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <button
              onMouseDown={() => startHold(-1)}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onTouchStart={() => startHold(-1)}
              onTouchEnd={stopHold}
              disabled={duration <= MIN_DURATION}
              className="flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ width: 56, height: 56 }}
            >
              <span className="material-symbols-outlined text-3xl">remove</span>
            </button>

            <div className="flex-1 flex flex-col items-center">
              <span className="text-5xl font-bold tabular-nums leading-none text-gray-900 dark:text-gray-100">
                {duration}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">minutos</span>
            </div>

            <button
              onMouseDown={() => startHold(1)}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onTouchStart={() => startHold(1)}
              onTouchEnd={stopHold}
              disabled={duration >= MAX_DURATION}
              className="flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ width: 56, height: 56 }}
            >
              <span className="material-symbols-outlined text-3xl">add</span>
            </button>
          </div>

          {/* Presets rápidos */}
          <div className="flex gap-2">
            {QUICK_PRESETS.map((min) => (
              <button
                key={min}
                onClick={() => setDuration(min)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  duration === min
                    ? 'bg-primary/15 text-primary border border-primary/30'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {min} min
              </button>
            ))}
          </div>
        </div>

        {/* Botón arrancar */}
        <button
          onClick={handleStart}
          disabled={!canStart || isLoading}
          className="mt-1 w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-white text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          style={{ height: '52px' }}
        >
          {isLoading ? (
            <span className="text-sm">Iniciando...</span>
          ) : (
            <>
              <span className="material-symbols-outlined text-lg">play_arrow</span>
              <span>
                {selectedSectorId === null ? 'Selecciona un sector' : `Iniciar ${duration} min`}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
