import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAtomValue } from 'jotai';
import { Colors, getThemeColors } from '../../theme/colors';
import { sectorNamesAtom } from '../../Settings/settings.state';
import type { Sector } from '../schedule.state';

interface SectorCardProps {
  sector: Sector;
  onToggle: (id: number, isActive: boolean) => void;
}

export const SectorCard: React.FC<SectorCardProps> = ({ sector, onToggle }) => {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme);
  const isPrimary = sector.color === 'primary';
  const sectorNames = useAtomValue(sectorNamesAtom);
  const displayName = sectorNames[sector.id] ?? sector.name;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/sector/${sector.id}`)}
      style={[styles.card, { backgroundColor: theme.surface }]}
      activeOpacity={0.85}
    >
      <View style={styles.topRow}>
        {/* Icono del sector */}
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: isPrimary
                ? `${Colors.primary}22`
                : `${Colors.secondary}22`,
            },
          ]}
        >
          <Ionicons
            name="leaf-outline"
            size={28}
            color={isPrimary ? Colors.primary : Colors.secondary}
          />
        </View>

        {/* Nombre y badges */}
        <View style={styles.nameBlock}>
          <Text style={[styles.sectorName, { color: theme.text }]}>{displayName}</Text>
          <View style={styles.badges}>
            <View
              style={[
                styles.badge,
                { backgroundColor: sector.isActive ? Colors.secondary : theme.inactive },
              ]}
            >
              <Ionicons
                name={sector.isActive ? 'pause' : 'play'}
                size={11}
                color={sector.isActive ? Colors.white : theme.text}
              />
              <Text
                style={[
                  styles.badgeText,
                  { color: sector.isActive ? Colors.white : theme.text },
                ]}
              >
                {sector.isActive ? 'Activado' : 'Inactivo'}
              </Text>
            </View>

            <View style={[styles.badge, { backgroundColor: theme.inactive }]}>
              <Ionicons
                name={sector.isAuto ? 'sync-outline' : 'hand-left-outline'}
                size={11}
                color={theme.text}
              />
              <Text style={[styles.badgeText, { color: theme.text }]}>
                {sector.isAuto ? 'Auto' : 'Manual'}
              </Text>
            </View>
          </View>
        </View>

        {/* Toggle switch */}
        <TouchableOpacity
          onPress={() => onToggle(sector.id, !sector.isActive)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.switchTrack,
              { backgroundColor: sector.isActive ? Colors.primary : theme.inactive },
            ]}
          >
            <View
              style={[
                styles.switchThumb,
                {
                  transform: [{ translateX: sector.isActive ? 20 : 0 }],
                },
              ]}
            />
          </View>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  nameBlock: {
    flex: 1,
  },
  sectorName: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    height: 28,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  switchTrack: {
    width: 51,
    height: 31,
    borderRadius: 999,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
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
