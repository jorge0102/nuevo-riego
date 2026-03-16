import { atom } from 'jotai';
import { apiFetch } from '../config/api';
import { mockAPIData, mockWeeklySchedule, type MockWeekDay } from './home.mocks';

export interface TankStatus {
  isWatering: boolean;
  sectorId: number | null;
  sectorName: string | null;
  timeRemaining: string;
  tankLevel: number;
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
  tankLevel: 0,
});

export const weeklyScheduleAtom = atom<WeekDay[]>([]);

export const isDarkModeAtom = atom<boolean>(false);

class HomeService {
  async getTankLevel(): Promise<number> {
    try {
      const res = await apiFetch('/tank/level');
      const data = await res.json();
      return data.level;
    } catch {
      return mockAPIData.tankLevel;
    }
  }

  async getWateringStatus(): Promise<{ isWatering: boolean; sectorId: number | null; sectorName: string | null; timeRemaining: string }> {
    try {
      const res = await apiFetch('/watering/status');
      const data = await res.json();
      return { isWatering: data.isWatering, sectorId: data.sectorId ?? null, sectorName: data.sectorName ?? null, timeRemaining: data.timeRemaining };
    } catch {
      return { isWatering: false, sectorId: null, sectorName: null, timeRemaining: '00:00' };
    }
  }

  async toggleWatering(action: 'pause' | 'resume'): Promise<void> {
    try {
      await apiFetch('/watering/' + action, { method: 'POST' });
    } catch { /* la UI usa actualización optimista */ }
  }

  async startManualWatering(sectorId: number, duration: number): Promise<void> {
    try {
      await apiFetch('/watering/manual', {
        method: 'POST',
        body: JSON.stringify({ sectorId, duration }),
      });
    } catch { /* la UI usa actualización optimista */ }
  }

  async getWeeklySchedule(): Promise<MockWeekDay[]> {
    try {
      const res = await apiFetch('/schedule/weekly');
      const data = await res.json();
      return data.schedule;
    } catch {
      return mockWeeklySchedule;
    }
  }
}

export const homeService = new HomeService();
