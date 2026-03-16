import React, { useState } from 'react';

const MAX_ACTIVE = 2;
const DURATION_OPTIONS = [5, 10, 15, 30, 45, 60];

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
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [isLoading, setIsLoading] = useState(false);

  if (!visible) return null;

  const wouldExceedLimit = activeSectorCount >= MAX_ACTIVE;
  const canStart = selectedSectorId !== null && !wouldExceedLimit;

  const handleStart = async () => {
    if (!canStart || selectedSectorId === null) return;
    setIsLoading(true);
    try {
      await onStart(selectedSectorId, selectedDuration);
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
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Selecciona sector y duración
            </p>
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
                Máximo {MAX_ACTIVE} sectores activos simultáneamente. Activar más sectores puede quemar el transformador.
              </p>
            </div>
          </div>
        )}

        {/* Sector */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            Sector
          </p>
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
                    <span className={`material-symbols-outlined text-lg ${isSelected ? 'text-white' : 'text-primary'}`}>
                      yard
                    </span>
                    {s.name}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Duración */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            Duración
          </p>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((min) => {
              const isSelected = selectedDuration === min;
              return (
                <button
                  key={min}
                  onClick={() => setSelectedDuration(min)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold min-w-[72px] transition-colors ${
                    isSelected
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {min} min
                </button>
              );
            })}
          </div>
        </div>

        {/* Botón */}
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
                {selectedSectorId === null
                  ? 'Selecciona un sector'
                  : `Iniciar ${selectedDuration} min`}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
