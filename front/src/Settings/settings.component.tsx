
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { appNameAtom, sectorNamesAtom, enabledSectorsAtom } from './settings.state';

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
  const [enabledSectors, setEnabledSectors] = useAtom(enabledSectorsAtom);

  const getSectorName = (id: number) =>
    sectorNames[id] ?? DEFAULT_SECTOR_NAMES[id] ?? `Sector ${id}`;

  const handleSectorName = (id: number, value: string) => {
    setSectorNames((prev) => ({ ...prev, [id]: value }));
  };

  const handleToggleEnabled = (id: number) => {
    setEnabledSectors((prev) => ({ ...prev, [id]: !prev[id] }));
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

        {/* Sectores */}
        <section className="flex flex-col gap-3 rounded-xl bg-surface-light dark:bg-surface-dark p-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">yard</span>
            <h2 className="text-base font-semibold">Sectores</h2>
          </div>
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((id) => {
              const isEnabled = enabledSectors[id] ?? true;
              return (
                <div key={id} className={`flex flex-col gap-2 rounded-lg p-3 border transition-colors ${isEnabled ? 'border-primary/30 bg-primary/5' : 'border-gray-200 dark:border-gray-700'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Sector {id}</span>
                    <label className="relative flex h-[28px] w-[46px] cursor-pointer items-center rounded-full p-0.5">
                      <input
                        type="checkbox"
                        className="invisible absolute"
                        checked={isEnabled}
                        onChange={() => handleToggleEnabled(id)}
                      />
                      <div
                        onClick={() => handleToggleEnabled(id)}
                        className={`w-full h-full rounded-full transition-colors ${isEnabled ? 'bg-primary' : 'bg-inactive-light dark:bg-inactive-dark'}`}
                      >
                        <div
                          className="h-[24px] w-[24px] rounded-full bg-white transition-transform duration-200 ease-in-out mt-[0px]"
                          style={{
                            transform: isEnabled ? 'translateX(18px)' : 'translateX(0px)',
                            boxShadow: 'rgba(0,0,0,0.1) 0px 2px 4px',
                          }}
                        />
                      </div>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={getSectorName(id)}
                    onChange={(e) => handleSectorName(id, e.target.value)}
                    placeholder={DEFAULT_SECTOR_NAMES[id]}
                    disabled={!isEnabled}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark px-4 py-2.5 text-sm font-medium outline-none focus:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* Reset */}
        <button
          onClick={() => {
            setAppName('Finca Eloy');
            setSectorNames({});
            setEnabledSectors({ 1: true, 2: true, 3: true, 4: true });
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
