import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Colors, getThemeColors } from '../../theme/colors';

interface TimeDurationProps {
  startTime: string;
  duration: number;
  onStartTimeChange: (time: string) => void;
  onDurationChange: (duration: number) => void;
}

export const TimeDuration: React.FC<TimeDurationProps> = ({
  startTime,
  duration,
  onStartTimeChange,
  onDurationChange,
}) => {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme);

  const adjustTime = (delta: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    let newMinutes = minutes + delta * 15;
    let newHours = hours;
    if (newMinutes >= 60) { newMinutes = 0; newHours = (newHours + 1) % 24; }
    if (newMinutes < 0) { newMinutes = 45; newHours = (newHours - 1 + 24) % 24; }
    onStartTimeChange(`${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`);
  };

  const adjustDuration = (delta: number) => {
    onDurationChange(Math.min(180, Math.max(5, duration + delta * 5)));
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.text }]}>🕐  Horario y Duración</Text>
      <View style={styles.grid}>
        {/* Hora de inicio */}
        <View style={[styles.block, { backgroundColor: theme.background }]}>
          <Text style={[styles.blockLabel, { color: theme.textMuted }]}>Hora de Inicio</Text>
          <View style={styles.stepper}>
            <TouchableOpacity onPress={() => adjustTime(-1)} style={[styles.stepBtn, { backgroundColor: theme.surface }]}>
              <Text style={[styles.stepBtnText, { color: theme.text }]}>−</Text>
            </TouchableOpacity>
            <Text style={[styles.valueText, { color: theme.text }]}>{startTime}</Text>
            <TouchableOpacity onPress={() => adjustTime(1)} style={[styles.stepBtn, { backgroundColor: theme.surface }]}>
              <Text style={[styles.stepBtnText, { color: theme.text }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Duración */}
        <View style={[styles.block, { backgroundColor: theme.background }]}>
          <Text style={[styles.blockLabel, { color: theme.textMuted }]}>Duración</Text>
          <View style={styles.stepper}>
            <TouchableOpacity onPress={() => adjustDuration(-1)} style={[styles.stepBtn, { backgroundColor: theme.surface }]}>
              <Text style={[styles.stepBtnText, { color: theme.text }]}>−</Text>
            </TouchableOpacity>
            <Text style={[styles.valueText, { color: theme.text }]}>
              {duration}<Text style={styles.unit}> min</Text>
            </Text>
            <TouchableOpacity onPress={() => adjustDuration(1)} style={[styles.stepBtn, { backgroundColor: theme.surface }]}>
              <Text style={[styles.stepBtnText, { color: theme.text }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  grid: {
    gap: 10,
  },
  block: {
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    gap: 8,
  },
  blockLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 22,
    fontWeight: '400',
  },
  valueText: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1,
    minWidth: 90,
    textAlign: 'center',
  },
  unit: {
    fontSize: 16,
    fontWeight: '400',
  },
});
