import React from 'react';
import { useAppTheme } from '../../theme/useAppTheme';
import {
  View,
  Text,
  StyleSheet,
  Image,
  
} from 'react-native';
import { Colors, getThemeColors } from '../../theme/colors';

interface MainStatusCardProps {
  isWatering: boolean;
  sectorName: string | null;
  timeRemaining: string;
}

export const MainStatusCard: React.FC<MainStatusCardProps> = ({
  isWatering,
  sectorName,
  timeRemaining,
}) => {
  const scheme = useAppTheme();
  const theme = getThemeColors(scheme);

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.row}>
        <Image
          source={{
            uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCX-qI75F7I9Fa-okePuaRZ_0QHhGei-f3Kk8P1erR5GRHqZC-LctGboERU9Uo5ZkBT2HjHr4D5XU5GYmeQeV3KxlfJXgW1aF-hAuIbwTBoJBKJ273-ljPBj_CaLUZGZttHest-7vvFgZ5mx9SeNGv7n5rglJcAMtyC8KtX8IiIYZWdIZwLuC7h94t2oNNf-oW1RMn4BPkyYcH0_YPald_oLorEMndY5rNZ7Ckj-5DKABj_uWCDOmm50gYoPWAekVQus5h12NuLr8SW',
          }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.info}>
          <View style={[styles.badge, { backgroundColor: isWatering ? `${Colors.primary}22` : theme.inactive }]}>
            <Text style={[styles.badgeText, { color: isWatering ? Colors.primary : theme.textMuted }]}>
              {isWatering ? 'Regando' : 'Inactivo'}
            </Text>
          </View>

          {isWatering ? (
            <>
              <Text style={[styles.sectorName, { color: theme.text }]} numberOfLines={1}>
                {sectorName ?? 'Sector'}
              </Text>
              <View style={styles.timeBlock}>
                <Text style={[styles.timeLabel, { color: theme.textMuted }]}>Tiempo restante</Text>
                <Text style={[styles.timeValue, { color: Colors.primary }]}>{timeRemaining}</Text>
              </View>
            </>
          ) : (
            <Text style={[styles.idleText, { color: theme.textMuted }]}>
              Sin riego activo
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: 160,
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  image: {
    flex: 1,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectorName: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  timeBlock: {
    gap: 2,
  },
  timeLabel: {
    fontSize: 11,
    lineHeight: 16,
  },
  timeValue: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
  idleText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
