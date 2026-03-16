
import { atom } from 'jotai';
import { apiFetch } from '../config/api';
import { mockSectors } from './schedule.mocks';

export interface Sector {
  id: number;
  name: string;
  icon: string;
  isActive: boolean;
  isAuto: boolean;
  color: 'primary' | 'secondary';
}

export const sectorsAtom = atom<Sector[]>([]);

class ScheduleService {
  async getSectors(): Promise<Sector[]> {
    try {
      const res = await apiFetch('/sectors');
      const data = await res.json();
      return data.sectors;
    } catch {
      return mockSectors;
    }
  }

  async toggleSector(sectorId: number, isActive: boolean): Promise<void> {
    try {
      await apiFetch(`/sectors/${sectorId}/toggle`, {
        method: 'POST',
        body: JSON.stringify({ isActive }),
      });
    } catch { /* la UI usa actualización optimista */ }
  }

  async toggleMode(sectorId: number, isAuto: boolean): Promise<void> {
    try {
      await apiFetch(`/sectors/${sectorId}/mode`, {
        method: 'POST',
        body: JSON.stringify({ isAuto }),
      });
    } catch { /* la UI usa actualización optimista */ }
  }
}

export const scheduleService = new ScheduleService();
