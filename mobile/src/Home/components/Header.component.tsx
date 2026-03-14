import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, getThemeColors } from '../../theme/colors';

interface HeaderProps {
  title: string;
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onSettingsClick }) => {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.iconLeft}>
        <Ionicons name="leaf" size={22} color={Colors.primary} />
      </View>
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
