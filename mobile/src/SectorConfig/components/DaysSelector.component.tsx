import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Colors, getThemeColors } from '../../theme/colors';
import type { DayConfig } from '../sector-config.mocks';

interface DaysSelectorProps {
  days: DayConfig[];
  onChange: (days: DayConfig[]) => void;
}

export const DaysSelector: React.FC<DaysSelectorProps> = ({ days, onChange }) => {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme);

  const toggleDay = (index: number) => {
    const newDays = days.map((d, i) => (i === index ? { ...d, active: !d.active } : d));
    onChange(newDays);
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.text }]}>📅  Días de Riego</Text>
      <View style={styles.daysRow}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={day.day}
            onPress={() => toggleDay(index)}
            style={[
              styles.dayButton,
              {
                backgroundColor: day.active ? Colors.primary : theme.background,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.dayText,
                { color: day.active ? Colors.white : theme.text },
              ]}
            >
              {day.day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minWidth: 36,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
