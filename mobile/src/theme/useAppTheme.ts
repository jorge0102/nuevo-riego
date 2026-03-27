import { useColorScheme } from 'react-native';
import { useAtomValue } from 'jotai';
import { themeModeAtom } from '../Settings/settings.state';
import type { ColorScheme } from './colors';

export function useAppTheme(): ColorScheme {
  const system = (useColorScheme() ?? 'light') as ColorScheme;
  const mode = useAtomValue(themeModeAtom);
  return mode === 'system' ? system : mode;
}
