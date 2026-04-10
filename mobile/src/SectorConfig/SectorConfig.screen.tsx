import React, { useEffect, useState } from 'react';
import { useAppTheme } from '../theme/useAppTheme';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAtom, useAtomValue } from 'jotai';
import { sectorConfigAtom, sectorConfigService, type SectorConfiguration } from './sector-config.state';
import { sectorNamesAtom } from '../Settings/settings.state';
import { getThemeColors, Colors } from '../theme/colors';
import { ModeToggle } from './components/ModeToggle.component';
import { DaysSelector } from './components/DaysSelector.component';
import { TimeDuration } from './components/TimeDuration.component';
import { RepeatCycle } from './components/RepeatCycle.component';
import type { DayConfig } from './sector-config.mocks';

export default function SectorConfigScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useAppTheme();
  const theme = getThemeColors(scheme);
  const [config, setConfig] = useAtom(sectorConfigAtom);
  const sectorNames = useAtomValue(sectorNamesAtom);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      if (!id) return;
      try {
        setError(false);
        const sectorConfig = await sectorConfigService.getSectorConfig(Number(id));
        setConfig(sectorConfig);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, [id, setConfig]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backIcon, { color: Colors.primary }]}>←</Text>
          </TouchableOpacity>
        </View>
        <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (error || !config) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backIcon, { color: Colors.primary }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Configuración</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color={theme.textMuted} />
          <Text style={[styles.errorTitle, { color: theme.text }]}>Sin conexión</Text>
          <Text style={[styles.errorText, { color: theme.textMuted }]}>
            No se pudo cargar la configuración.{'\n'}Comprueba que el Pi está encendido.
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.retryButton}>
            <Text style={styles.retryText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const updateConfig = (updates: Partial<SectorConfiguration>) => {
    setConfig((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    try {
      await sectorConfigService.saveSectorConfig(config);
      router.back();
    } catch (e) {
      console.error('Error guardando configuración:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backIcon, { color: Colors.primary }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Ionicons name="leaf-outline" size={20} color={Colors.primary} />
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {sectorNames[config.id] ?? config.name}
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ModeToggle isAuto={config.isAuto} onChange={(isAuto) => updateConfig({ isAuto })} />
        <DaysSelector days={config.days ?? []} onChange={(days: DayConfig[]) => updateConfig({ days })} />
        <TimeDuration
          startTime={config.startTime}
          duration={config.duration}
          onStartTimeChange={(startTime) => updateConfig({ startTime })}
          onDurationChange={(duration) => updateConfig({ duration })}
        />
        <RepeatCycle
          repeatCycle={config.repeatCycle}
          onChange={(repeatCycle) => updateConfig({ repeatCycle })}
        />

        {/* Botones */}
        <View style={styles.buttons}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.cancelButton, { borderColor: `${Colors.primary}44` }]}
          >
            <Text style={[styles.cancelText, { color: Colors.primaryDark }]}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            style={[styles.saveButton, { opacity: isSaving ? 0.6 : 1 }]}
          >
            <Text style={styles.saveText}>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 28,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    flex: 1,
  },
  headerRight: { width: 48 },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  buttons: {
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '700',
  },
  saveButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});
