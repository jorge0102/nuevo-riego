import AsyncStorage from '@react-native-async-storage/async-storage';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

const storage = createJSONStorage(() => AsyncStorage);

export type ThemeMode = 'light' | 'dark' | 'system';
export const themeModeAtom = atomWithStorage<ThemeMode>('riego_themeMode', 'system', storage);

export const appNameAtom = atomWithStorage<string>('riego_appName', 'Finca Eloy', storage);
export const sectorNamesAtom = atomWithStorage<Record<number, string>>('riego_sectorNames', {}, storage);
export const enabledSectorsAtom = atomWithStorage<Record<number, boolean>>(
  'riego_enabledSectors',
  { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true },
  storage,
);
