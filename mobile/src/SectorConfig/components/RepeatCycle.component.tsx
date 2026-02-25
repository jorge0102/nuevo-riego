import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Colors, getThemeColors } from '../../theme/colors';

interface RepeatCycleProps {
  repeatCycle: boolean;
  onChange: (repeat: boolean) => void;
}

export const RepeatCycle: React.FC<RepeatCycleProps> = ({ repeatCycle, onChange }) => {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme);

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={styles.row}>
        <View style={styles.labelRow}>
          <View style={styles.iconWrapper}>
            <Text style={styles.icon}>🔁</Text>
          </View>
          <Text style={[styles.label, { color: theme.text }]}>Repetir ciclo</Text>
        </View>
        <TouchableOpacity onPress={() => onChange(!repeatCycle)} activeOpacity={0.8}>
          <View style={[styles.track, { backgroundColor: repeatCycle ? Colors.primary : theme.inactive }]}>
            <View style={[styles.thumb, { transform: [{ translateX: repeatCycle ? 20 : 0 }] }]} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: `${Colors.primary}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 22 },
  label: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  track: {
    width: 51,
    height: 31,
    borderRadius: 999,
    padding: 2,
    justifyContent: 'center',
  },
  thumb: {
    width: 27,
    height: 27,
    borderRadius: 999,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
});
