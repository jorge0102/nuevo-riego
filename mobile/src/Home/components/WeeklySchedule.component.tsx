import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, getThemeColors } from '../../theme/colors';

interface WeekDay {
  day: string;
  hasWatering: boolean;
}

interface WeeklyScheduleProps {
  schedule: WeekDay[];
}

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({ schedule }) => {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme);

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Text style={[styles.title, { color: theme.text }]}>Programa Semanal</Text>
      <View style={styles.days}>
        {schedule.map((item, index) => (
          <View key={index} style={styles.dayCol}>
            <Text style={[styles.dayLabel, { color: theme.textMuted }]}>{item.day}</Text>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: item.hasWatering
                    ? `${Colors.primary}33`
                    : theme.inactive,
                },
              ]}
            >
              {item.hasWatering && (
                <Ionicons name="water" size={14} color={Colors.primary} />
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  days: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
