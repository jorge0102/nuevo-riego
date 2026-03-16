
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { appNameAtom, sectorNamesAtom } from './settings.state';

const DEFAULT_SECTOR_NAMES: Record<number, string> = {
  1: 'Sector 1: Aguacates',
  2: 'Sector 2: Mangos',
  3: 'Sector 3: Pencas',
  4: 'Sector 4: Pitayas',
};

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [appName, setAppName] = useAtom(appNameAtom);
  const [sectorNames, setSectorNames] = useAtom(sectorNamesAtom);

  const getSectorName = (id: number) =>
    sectorNames[id] ?? DEFAULT_SECTOR_NAMES[id] ?? `Sector ${id}`;

  const handleSectorName = (id: number, value: string) => {
    setSectorNames((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden p-4 md:p-6 lg:p-8 bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark">
      <div className="flex items-center justify-between pb-6">
        <h1 className="text-2xl font-bold leading-tight tracking-tight">Configuración</h1>
        <button
          onClick={() => navigate('/')}
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-light dark:bg-surface-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {/* Nombre de la finca */}
        <section className="flex flex-col gap-3 rounded-xl bg-surface-light dark:bg-surface-dark p-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">home</span>
            <h2 className="text-base font-semibold">Nombre de la finca</h2>
          </div>
          <input
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            placeholder="Nombre de la finca"
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark px-4 py-3 text-sm font-medium outline-none focus:border-primary transition-colors"
          />
        </section>

        {/* Nombres de sectores */}
        <section className="flex flex-col gap-3 rounded-xl bg-surface-light dark:bg-surface-dark p-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">yard</span>
            <h2 className="text-base font-semibold">Nombres de sectores</h2>
          </div>
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((id) => (
              <div key={id} className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Sector {id}
                </label>
                <input
                  type="text"
                  value={getSectorName(id)}
                  onChange={(e) => handleSectorName(id, e.target.value)}
                  placeholder={DEFAULT_SECTOR_NAMES[id]}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark px-4 py-3 text-sm font-medium outline-none focus:border-primary transition-colors"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Reset */}
        <button
          onClick={() => {
            setAppName('Finca Eloy');
            setSectorNames({});
          }}
          className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 py-3 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
        >
          Restablecer valores por defecto
        </button>
      </div>
    </div>
  );
};

export default Settings;
