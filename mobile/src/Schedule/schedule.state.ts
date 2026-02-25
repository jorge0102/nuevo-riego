import { atom } from 'jotai';
import { mockScheduleData, simulateDelay, type MockSector } from './schedule.mocks';

export interface Sector {
  id: number;
  name: string;
  icon: string;
  isActive: boolean;
  isAuto: boolean;
  color: 'primary' | 'secondary';
}

export const tankLevelAtom = atom<number>(75);
export const sectorsAtom = atom<Sector[]>(mockScheduleData.sectors);

class ScheduleService {
  private apiBaseUrl: string;
  private useMock: boolean;

  constructor(apiBaseUrl = 'http://localhost:3000/api', useMock = true) {
    this.apiBaseUrl = apiBaseUrl;
    this.useMock = useMock;
  }

  async getTankLevel(): Promise<number> {
    if (this.useMock) {
      await simulateDelay();
      return mockScheduleData.tankLevel;
    }
    const response = await fetch(`${this.apiBaseUrl}/tank/level`);
    if (!response.ok) throw new Error('Error al obtener nivel del tanque');
    const data = await response.json();
    return data.level;
  }

  async getSectors(): Promise<MockSector[]> {
    if (this.useMock) {
      await simulateDelay();
      return mockScheduleData.sectors;
    }
    const response = await fetch(`${this.apiBaseUrl}/sectors`);
    if (!response.ok) throw new Error('Error al obtener sectores');
    const data = await response.json();
    return data.sectors;
  }

  async toggleSector(sectorId: number, isActive: boolean): Promise<void> {
    if (this.useMock) {
      await simulateDelay(200);
      const sector = mockScheduleData.sectors.find((s) => s.id === sectorId);
      if (sector) sector.isActive = isActive;
      return;
    }
    const response = await fetch(`${this.apiBaseUrl}/sectors/${sectorId}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
    if (!response.ok) throw new Error('Error al cambiar estado del sector');
  }

  async toggleMode(sectorId: number, isAuto: boolean): Promise<void> {
    if (this.useMock) {
      await simulateDelay(200);
      const sector = mockScheduleData.sectors.find((s) => s.id === sectorId);
      if (sector) sector.isAuto = isAuto;
      return;
    }
    const response = await fetch(`${this.apiBaseUrl}/sectors/${sectorId}/mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAuto }),
    });
    if (!response.ok) throw new Error('Error al cambiar modo del sector');
  }
}

export const scheduleService = new ScheduleService('http://localhost:3000/api', true);
