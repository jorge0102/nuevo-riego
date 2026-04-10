import { atom } from 'jotai';
import { apiFetch } from '../config/api';

export interface TankStatus {
  isWatering: boolean;
  sectorId: number | null;
  sectorName: string | null;
  timeRemaining: string;
  remainingSeconds: number;
  tankLevel: number;
}

export function formatSeconds(seconds: number): string {
  const s = Math.max(0, seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export interface WeekDay {
  day: string;
  hasWatering: boolean;
}

export const tankStatusAtom = atom<TankStatus>({
  isWatering: false,
  sectorId: null,
  sectorName: null,
  timeRemaining: '00:00',
  remainingSeconds: 0,
  tankLevel: 0,
});

export const weeklyScheduleAtom = atom<WeekDay[]>([]);

export const isDarkModeAtom = atom<boolean>(false);

class HomeService {
  async getTankLevel(): Promise<number> {
    const res = await apiFetch('/tank/level');
    const data = await res.json();
    return data.level;
  }

  async getWateringStatus(): Promise<{ isWatering: boolean; sectorId: number | null; sectorName: string | null; timeRemaining: string; remainingSeconds: number }> {
    const res = await apiFetch('/watering/status');
    const data = await res.json();
    return {
      isWatering: data.isWatering,
      sectorId: data.sectorId ?? null,
      sectorName: data.sectorName ?? null,
      timeRemaining: data.timeRemaining ?? '00:00',
      remainingSeconds: data.remainingSeconds ?? 0,
    };
  }

  async toggleWatering(action: 'pause' | 'resume'): Promise<void> {
    await apiFetch('/watering/' + action, { method: 'POST' });
  }

  async startManualWatering(sectorId: number, duration: number): Promise<void> {
    await apiFetch('/watering/manual', {
      method: 'POST',
      body: JSON.stringify({ sectorId, duration }),
    });
  }

  async getWeeklySchedule(): Promise<WeekDay[]> {
    const res = await apiFetch('/schedule/weekly');
    const data = await res.json();
    return data.schedule;
  }
}

export const homeService = new HomeService();
