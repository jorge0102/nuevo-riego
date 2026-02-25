import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  useColorScheme,
} from 'react-native';
import { Colors, getThemeColors } from '../../theme/colors';

interface MainStatusCardProps {
  isWatering: boolean;
  timeRemaining: string;
  onPauseClick: () => void;
}

export const MainStatusCard: React.FC<MainStatusCardProps> = ({
  isWatering,
  timeRemaining,
  onPauseClick,
}) => {
  const scheme = useColorScheme() ?? 'light';
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
          <Text style={[styles.statusText, { color: theme.text }]}>
            {isWatering ? 'Regando' : 'Inactivo'}
          </Text>
          <View style={styles.timeBlock}>
            <Text style={[styles.timeLabel, { color: theme.textMuted }]}>
              Tiempo restante
            </Text>
            <Text style={[styles.timeValue, { color: theme.text }]}>
              {timeRemaining}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onPauseClick}
            style={styles.actionButton}
            activeOpacity={0.85}
          >
            <Text style={styles.actionButtonIcon}>
              {isWatering ? '⏸' : '▶️'}
            </Text>
            <Text style={styles.actionButtonText}>
              {isWatering ? 'Pausa' : 'Reanudar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
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
    width: '48%',
    borderRadius: 8,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
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
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 8,
    height: 32,
    paddingHorizontal: 12,
    gap: 6,
  },
  actionButtonIcon: {
    fontSize: 14,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
