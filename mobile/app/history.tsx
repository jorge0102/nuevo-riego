import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch } from '../src/config/api';
import { getThemeColors, Colors } from '../src/theme/colors';

interface HistoryEntry {
  id: number;
  sectorName: string;
  startedAt: string;
  duration: number;
  type: 'manual' | 'auto';
}

async function fetchHistory(): Promise<HistoryEntry[]> {
  const res = await apiFetch('/watering/history');
  const data = await res.json();
  return data.history ?? [];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export default function HistoryScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(false);
      const data = await fetchHistory();
      setEntries(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Historial</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.centered} />
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={48} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin conexión</Text>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            No se pudo conectar con la API.{'\n'}Comprueba que el Pi está encendido.
          </Text>
          <TouchableOpacity onPress={load} style={styles.retryButton}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="time-outline" size={48} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin registros</Text>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            Aquí aparecerán los riegos realizados cuando la API lo soporte.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {entries.map((entry) => (
            <View key={entry.id} style={[styles.card, { backgroundColor: theme.surface }]}>
              <View style={[styles.iconBg, { backgroundColor: `${Colors.primary}1A` }]}>
                <Ionicons
                  name={entry.type === 'manual' ? 'hand-left-outline' : 'sync-outline'}
                  size={20}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.sectorName, { color: theme.text }]}>
                  {entry.sectorName}
                </Text>
                <Text style={[styles.meta, { color: theme.textMuted }]}>
                  {formatDate(entry.startedAt)} · {formatTime(entry.startedAt)}
                </Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={[styles.duration, { color: Colors.primary }]}>
                  {entry.duration} min
                </Text>
                <View
                  style={[
                    styles.typeBadge,
                    { backgroundColor: entry.type === 'manual' ? `${Colors.secondary}22` : `${Colors.primary}1A` },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeText,
                      { color: entry.type === 'manual' ? Colors.secondary : Colors.primary },
                    ]}
                  >
                    {entry.type === 'manual' ? 'Manual' : 'Auto'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
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
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerRight: { width: 48 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
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
  list: {
    padding: 16,
    gap: 10,
  },
  card: {
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    gap: 3,
  },
  sectorName: {
    fontSize: 15,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
    lineHeight: 16,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  duration: {
    fontSize: 15,
    fontWeight: '700',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
