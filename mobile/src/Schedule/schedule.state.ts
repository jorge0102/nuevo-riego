import { atom } from 'jotai';
import { apiFetch } from '../config/api';

export interface Sector {
  id: number;
  name: string;
  icon: string;
  isActive: boolean;
  isAuto: boolean;
  color: 'primary' | 'secondary';
  timer?: {
    scheduled: boolean;
    runsAt?: string;
    remainingMinutes?: number;
    remainingSeconds?: number;
  };
}

export const tankLevelAtom = atom<number>(0);
export const sectorsAtom = atom<Sector[]>([]);

class ScheduleService {
  async getTankLevel(): Promise<number> {
    const res = await apiFetch('/tank/level');
    const data = await res.json();
    return data.level;
  }

  async getSectors(): Promise<Sector[]> {
    const res = await apiFetch('/sectors');
    const data = await res.json();
    return data.sectors;
  }

  async toggleSector(sectorId: number, isActive: boolean): Promise<void> {
    await apiFetch('/sectors/' + sectorId + '/toggle', {
      method: 'POST',
      body: JSON.stringify({ isActive }),
    });
  }

  async toggleMode(sectorId: number, isAuto: boolean): Promise<void> {
    await apiFetch('/sectors/' + sectorId + '/mode', {
      method: 'POST',
      body: JSON.stringify({ isAuto }),
    });
  }
}

export const scheduleService = new ScheduleService();
