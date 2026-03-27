import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAtom } from 'jotai';
import { Colors, getThemeColors } from '../../theme/colors';
import { useAppTheme } from '../../theme/useAppTheme';
import { themeModeAtom } from '../../Settings/settings.state';

interface HeaderProps {
  title: string;
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onSettingsClick }) => {
  const scheme = useAppTheme();
  const theme = getThemeColors(scheme);
  const [themeMode, setThemeMode] = useAtom(themeModeAtom);

  const toggleTheme = () => {
    // Si está en system o light → dark; si está en dark → light
    setThemeMode(scheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity onPress={toggleTheme} style={styles.iconLeft}>
        <Ionicons
          name={scheme === 'dark' ? 'sunny-outline' : 'moon-outline'}
          size={22}
          color={theme.text}
        />
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <TouchableOpacity onPress={onSettingsClick} style={styles.iconRight}>
        <Ionicons name="settings-outline" size={22} color={theme.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  iconLeft: {
    width: 40,
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  iconRight: {
    width: 40,
    alignItems: 'flex-end',
  },
});
