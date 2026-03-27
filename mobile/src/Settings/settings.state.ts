import AsyncStorage from '@react-native-async-storage/async-storage';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

const storage = createJSONStorage(() => AsyncStorage);

export const appNameAtom = atomWithStorage<string>('riego_appName', 'Finca Eloy', storage);
export const sectorNamesAtom = atomWithStorage<Record<number, string>>('riego_sectorNames', {}, storage);
export const enabledSectorsAtom = atomWithStorage<Record<number, boolean>>(
  'riego_enabledSectors',
  { 1: true, 2: true, 3: true, 4: true },
  storage,
);
