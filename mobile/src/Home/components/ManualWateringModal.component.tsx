import React, { useState } from 'react';
import { useAppTheme } from '../../theme/useAppTheme';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, getThemeColors } from '../../theme/colors';

const MAX_ACTIVE = 2;
const DURATION_OPTIONS = [2, 5, 10, 15, 30, 45, 60];
const CUSTOM_VALUE = -1;

export interface SectorOption {
  id: number;
  name: string;
}

interface ManualWateringModalProps {
  visible: boolean;
  onClose: () => void;
  onStart: (sectorId: number, duration: number) => Promise<void>;
  sectors: SectorOption[];
  activeSectorCount: number;
}

export const ManualWateringModal: React.FC<ManualWateringModalProps> = ({
  visible,
  onClose,
  onStart,
  sectors,
  activeSectorCount,
}) => {
  const scheme = useAppTheme();
  const theme = getThemeColors(scheme);
  const [selectedSectorId, setSelectedSectorId] = useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [isCustom, setIsCustom] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const wouldExceedLimit = activeSectorCount >= MAX_ACTIVE;
  const effectiveDuration = isCustom ? parseInt(customMinutes || '0', 10) : selectedDuration;
  const canStart = selectedSectorId !== null && !wouldExceedLimit && effectiveDuration > 0;

  const handleDurationSelect = (min: number) => {
    if (min === CUSTOM_VALUE) {
      setIsCustom(true);
    } else {
      setIsCustom(false);
      setSelectedDuration(min);
    }
  };

  const handleStart = async () => {
    if (!canStart || selectedSectorId === null) return;
    setIsLoading(true);
    try {
      await onStart(selectedSectorId, effectiveDuration);
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              Selecciona sector y duración
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={22} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
          {/* Aviso límite */}
          {wouldExceedLimit && (
            <View style={[styles.warningBox, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
              <Ionicons name="warning-outline" size={20} color="#DC2626" />
              <View style={{ flex: 1 }}>
                <Text style={styles.warningTitle}>Límite de seguridad alcanzado</Text>
                <Text style={styles.warningText}>
                  Máximo {MAX_ACTIVE} sectores activos. Activar más puede quemar el transformador.
                </Text>
              </View>
            </View>
          )}

          {/* Sector */}
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>Sector</Text>
          <View style={styles.sectorList}>
            {sectors.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>No hay sectores disponibles</Text>
            ) : (
              sectors.map((s) => {
                const isSelected = selectedSectorId === s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => !wouldExceedLimit && setSelectedSectorId(s.id)}
                    disabled={wouldExceedLimit}
                    activeOpacity={0.7}
                    style={[
                      styles.sectorChip,
                      {
                        backgroundColor: isSelected ? Colors.primary : theme.inactive,
                        opacity: wouldExceedLimit ? 0.4 : 1,
                      },
                    ]}
                  >
                    <Ionicons
                      name="leaf-outline"
                      size={16}
                      color={isSelected ? Colors.white : Colors.primary}
                    />
                    <Text style={[styles.sectorChipText, { color: isSelected ? Colors.white : theme.text }]}>
                      {s.name}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Duración */}
          <Text style={[styles.sectionLabel, { color: theme.textMuted, marginTop: 16 }]}>Duración</Text>
          <View style={styles.durationGrid}>
            {DURATION_OPTIONS.map((min) => {
              const isSelected = !isCustom && selectedDuration === min;
              return (
                <TouchableOpacity
                  key={min}
                  onPress={() => handleDurationSelect(min)}
                  style={[
                    styles.durationChip,
                    { backgroundColor: isSelected ? Colors.primary : theme.inactive },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.durationText, { color: isSelected ? Colors.white : theme.text }]}>
                    {min} min
                  </Text>
                </TouchableOpacity>
              );
            })}
            {/* Opción personalizada */}
            <TouchableOpacity
              onPress={() => handleDurationSelect(CUSTOM_VALUE)}
              style={[
                styles.durationChip,
                { backgroundColor: isCustom ? Colors.primary : theme.inactive },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil-outline" size={14} color={isCustom ? Colors.white : Colors.primary} />
              <Text style={[styles.durationText, { color: isCustom ? Colors.white : theme.text, marginLeft: 4 }]}>
                Otros
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input duración personalizada */}
          {isCustom && (
            <View style={[styles.customInputRow, { backgroundColor: theme.inactive }]}>
              <TextInput
                style={[styles.customInput, { color: theme.text }]}
                placeholder="Ej: 7"
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
                value={customMinutes}
                onChangeText={(v) => setCustomMinutes(v.replace(/[^0-9]/g, ''))}
                autoFocus
                maxLength={4}
              />
              <Text style={[styles.customInputLabel, { color: theme.textMuted }]}>minutos</Text>
            </View>
          )}
        </ScrollView>

        {/* Botón */}
        <TouchableOpacity
          onPress={handleStart}
          disabled={!canStart || isLoading}
          style={[styles.startButton, { opacity: !canStart || isLoading ? 0.5 : 1 }]}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Ionicons name="play" size={18} color={Colors.white} />
              <Text style={styles.startButtonText}>
                {selectedSectorId === null
                  ? 'Selecciona un sector'
                  : isCustom && !customMinutes
                  ? 'Introduce los minutos'
                  : `Iniciar ${effectiveDuration} min`}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
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
  headerText: { flex: 1, gap: 2 },
  title: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  subtitle: { fontSize: 12, lineHeight: 16 },
  closeButton: { padding: 4 },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  warningTitle: { fontSize: 13, fontWeight: '700', color: '#DC2626' },
  warningText: { fontSize: 12, color: '#DC2626', marginTop: 2, lineHeight: 16 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectorList: { gap: 8 },
  sectorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  sectorChipText: { fontSize: 14, fontWeight: '600', flex: 1 },
  emptyText: { fontSize: 14 },
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  durationText: { fontSize: 14, fontWeight: '600' },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginTop: 10,
    gap: 8,
  },
  customInput: {
    fontSize: 22,
    fontWeight: '700',
    minWidth: 60,
    paddingVertical: 8,
  },
  customInputLabel: {
    fontSize: 14,
    fontWeight: '500',
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
  startButtonText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
