import { atom } from 'jotai';
import { apiFetch } from '../config/api';
import type { MockWeekDay } from './home.mocks';

export interface TankStatus {
  isWatering: boolean;
  timeRemaining: string;
  tankLevel: number;
}

export interface WeekDay {
  day: string;
  hasWatering: boolean;
}

export const tankStatusAtom = atom<TankStatus>({
  isWatering: false,
  timeRemaining: '00:00',
  tankLevel: 0,
});

export const weeklyScheduleAtom = atom<WeekDay[]>([]);

class HomeService {
  async getTankLevel(): Promise<number> {
    const res = await apiFetch('/tank/level');
    const data = await res.json();
    return data.level;
  }

  async getWateringStatus(): Promise<{ isWatering: boolean; timeRemaining: string }> {
    const res = await apiFetch('/watering/status');
    const data = await res.json();
    return { isWatering: data.isWatering, timeRemaining: data.timeRemaining };
  }

  async toggleWatering(action: 'pause' | 'resume'): Promise<void> {
    await apiFetch('/watering/' + action, { method: 'POST' });
  }

  async startManualWatering(duration: number): Promise<void> {
    await apiFetch('/watering/manual', {
      method: 'POST',
      body: JSON.stringify({ duration }),
    });
  }

  async getWeeklySchedule(): Promise<MockWeekDay[]> {
    const res = await apiFetch('/schedule/weekly');
    const data = await res.json();
    return data.schedule;
  }
}

export const homeService = new HomeService();
