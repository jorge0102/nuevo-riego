import { atom } from 'jotai';
import { apiFetch } from '../config/api';

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
    const res = await apiFetch('/tank/level');
    const data = await res.json();
    return data.level;
  }

  async getWateringStatus(): Promise<{ isWatering: boolean; sectorId: number | null; sectorName: string | null; timeRemaining: string }> {
    const res = await apiFetch('/watering/status');
    const data = await res.json();
    return { isWatering: data.isWatering, sectorId: data.sectorId ?? null, sectorName: data.sectorName ?? null, timeRemaining: data.timeRemaining };
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
