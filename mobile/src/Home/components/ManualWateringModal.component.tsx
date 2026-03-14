import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, getThemeColors } from '../../theme/colors';

interface ManualWateringModalProps {
  visible: boolean;
  onClose: () => void;
  onStart: (duration: number) => Promise<void>;
}

const DURATION_OPTIONS = [5, 10, 15, 30, 45, 60];

export const ManualWateringModal: React.FC<ManualWateringModalProps> = ({
  visible,
  onClose,
  onStart,
}) => {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme);
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      await onStart(selectedDuration);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: theme.inactive }]} />

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: `${Colors.primary}1A` }]}>
            <Ionicons name="water" size={24} color={Colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.text }]}>Riego Manual</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              Activa todos los sectores durante el tiempo elegido
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={22} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Duración */}
        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>Duración</Text>
        <View style={styles.durationGrid}>
          {DURATION_OPTIONS.map((min) => {
            const isSelected = selectedDuration === min;
            return (
              <TouchableOpacity
                key={min}
                onPress={() => setSelectedDuration(min)}
                style={[
                  styles.durationChip,
                  {
                    backgroundColor: isSelected ? Colors.primary : theme.inactive,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.durationText,
                    { color: isSelected ? Colors.white : theme.text },
                  ]}
                >
                  {min} min
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Botón */}
        <TouchableOpacity
          onPress={handleStart}
          disabled={isLoading}
          style={[styles.startButton, { opacity: isLoading ? 0.7 : 1 }]}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Ionicons name="play" size={18} color={Colors.white} />
              <Text style={styles.startButtonText}>
                Iniciar {selectedDuration} min
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    gap: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  closeButton: {
    padding: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  durationChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  startButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  startButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
