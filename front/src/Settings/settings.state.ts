
import { atomWithStorage } from 'jotai/utils';

export const appNameAtom = atomWithStorage<string>('riego_appName', 'Finca Eloy');
export const sectorNamesAtom = atomWithStorage<Record<number, string>>('riego_sectorNames', {});
