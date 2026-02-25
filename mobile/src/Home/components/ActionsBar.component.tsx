import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { Colors, getThemeColors } from '../../theme/colors';

interface ActionsBarProps {
  onManualClick: () => void;
  onHistoryClick: () => void;
}

interface ActionItem {
  icon: string;
  label: string;
  isPrimary?: boolean;
  onPress: () => void;
}

export const ActionsBar: React.FC<ActionsBarProps> = ({ onManualClick, onHistoryClick }) => {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme);

  const actions: ActionItem[] = [
    { icon: '💧', label: 'Manual', isPrimary: true, onPress: onManualClick },
    { icon: '📅', label: 'Programa', onPress: () => router.push('/schedule') },
    { icon: '📊', label: 'Historial', onPress: onHistoryClick },
  ];

  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.label}
          onPress={action.onPress}
          style={styles.item}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: action.isPrimary
                  ? `${Colors.primary}1A`
                  : theme.inactive,
              },
            ]}
          >
            <Text style={styles.icon}>{action.icon}</Text>
          </View>
          <Text style={[styles.label, { color: theme.text }]}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 8,
  },
  iconWrapper: {
    borderRadius: 999,
    padding: 10,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
});
