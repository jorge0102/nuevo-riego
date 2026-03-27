import React from 'react';
import { useAppTheme } from '../../theme/useAppTheme';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAtomValue } from 'jotai';
import { Colors, getThemeColors } from '../../theme/colors';
import { sectorNamesAtom, enabledSectorsAtom } from '../../Settings/settings.state';
import type { SectorSchedule } from '../home.state';

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

interface WeeklyScheduleProps {
  sectors: SectorSchedule[];
}

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({ sectors }) => {
  const scheme = useAppTheme();
  const theme = getThemeColors(scheme);
  const sectorNames = useAtomValue(sectorNamesAtom);
  const enabledSectors = useAtomValue(enabledSectorsAtom);
  const visibleSectors = sectors.filter((s) => enabledSectors[s.id] ?? true);

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Text style={[styles.title, { color: theme.text }]}>Programa Semanal</Text>

      {visibleSectors.map((sector, idx) => (
        <View
          key={sector.id}
          style={[
            styles.row,
            idx < visibleSectors.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.inactive },
          ]}
        >
          {/* Nombre + hora */}
          <View style={styles.sectorInfo}>
            <Text style={[styles.sectorName, { color: theme.text }]} numberOfLines={1}>
              {sectorNames[sector.id] ?? sector.name}
            </Text>
            <View style={styles.timeBadge}>
              <Ionicons name="time-outline" size={11} color={theme.textMuted} />
              <Text style={[styles.timeText, { color: theme.textMuted }]}>
                {sector.startTime} · {sector.duration} min
              </Text>
            </View>
          </View>

          {/* Días */}
          <View style={styles.days}>
            {DAY_LABELS.map((label) => {
              const dayData = sector.days.find((d) => d.day === label);
              const active = dayData?.active ?? false;
              return (
                <View key={label} style={styles.dayCol}>
                  <Text style={[styles.dayLabel, { color: theme.textMuted }]}>{label}</Text>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: active ? `${Colors.primary}33` : theme.inactive },
                    ]}
                  >
                    {active && <Ionicons name="water" size={10} color={Colors.primary} />}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ))}
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
    marginBottom: 2,
  },
  row: {
    paddingVertical: 8,
    gap: 6,
  },
  sectorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectorName: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  days: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
