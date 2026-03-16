import React, { useState } from 'react';

interface ManualWateringModalProps {
  visible: boolean;
  onClose: () => void;
  onStart: (duration: number) => Promise<void>;
}

const DURATION_OPTIONS = [5, 10, 15, 30, 45, 60];

export const ManualWateringModal: React.FC<ManualWateringModalProps> = ({
  visible,
  onClose,
  onStart,
}) => {
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [isLoading, setIsLoading] = useState(false);

  if (!visible) return null;

  const handleStart = async () => {
    setIsLoading(true);
    try {
      await onStart(selectedDuration);
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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Sheet */}
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
              Activa todos los sectores durante el tiempo elegido
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Duración */}
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Duración
        </p>
        <div className="flex flex-wrap gap-2.5">
          {DURATION_OPTIONS.map((min) => {
            const isSelected = selectedDuration === min;
            return (
              <button
                key={min}
                onClick={() => setSelectedDuration(min)}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold min-w-[80px] transition-colors ${
                  isSelected
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {min} min
              </button>
            );
          })}
        </div>

        {/* Botón */}
        <button
          onClick={handleStart}
          disabled={isLoading}
          className="mt-1 h-13 w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-white text-base font-bold disabled:opacity-70 hover:bg-primary/90 transition-colors"
          style={{ height: '52px' }}
        >
          {isLoading ? (
            <span className="text-sm">Iniciando...</span>
          ) : (
            <>
              <span className="material-symbols-outlined text-lg">play_arrow</span>
              <span>Iniciar {selectedDuration} min</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
