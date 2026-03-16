
import { atomWithStorage } from 'jotai/utils';

export const appNameAtom = atomWithStorage<string>('riego_appName', 'Finca Eloy');
export const sectorNamesAtom = atomWithStorage<Record<number, string>>('riego_sectorNames', {});
export const enabledSectorsAtom = atomWithStorage<Record<number, boolean>>(
  'riego_enabledSectors',
  { 1: true, 2: true, 3: true, 4: true },
);
