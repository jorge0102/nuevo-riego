import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors, getThemeColors } from '../../theme/colors';

interface TankLevelCardProps {
  level: number;
  label?: string;
}

const getStatusText = (level: number): string => {
  if (level >= 70) return 'Nivel óptimo';
  if (level >= 40) return 'Nivel medio';
  return 'Nivel bajo';
};

const getStatusColor = (level: number, scheme: 'light' | 'dark'): string => {
  if (level >= 70) return scheme === 'dark' ? Colors.green400 : Colors.green600;
  if (level >= 40) return scheme === 'dark' ? Colors.yellow400 : Colors.yellow600;
  return scheme === 'dark' ? Colors.red400 : Colors.red600;
};

export const TankLevelCard: React.FC<TankLevelCardProps> = ({
  level,
  label = 'Nivel del Estanque',
}) => {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme);

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.topRow}>
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
        <Text style={[styles.percentage, { color: Colors.primary }]}>{level}%</Text>
      </View>
      <View style={[styles.trackBar, { backgroundColor: theme.inactive }]}>
        <View
          style={[
            styles.fillBar,
            { width: `${level}%`, backgroundColor: Colors.primary },
          ]}
        />
      </View>
      <Text style={[styles.status, { color: getStatusColor(level, scheme) }]}>
        {getStatusText(level)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  percentage: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  trackBar: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fillBar: {
    height: 6,
    borderRadius: 999,
  },
  status: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 16,
  },
});
