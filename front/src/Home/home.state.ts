
import { atom } from 'jotai';
import {
  mockAPIData,
  simulateDelay,
  formatTime,
  type MockWeekDay,
} from './home.mocks';

export interface TankStatus {
  isWatering: boolean;
  timeRemaining: string;
  tankLevel: number;
}

export interface WeekDay {
  day: string;
  hasWatering: boolean;
}

export interface HomeState {
  tankStatus: TankStatus;
  weeklySchedule: WeekDay[];
}

export const tankStatusAtom = atom<TankStatus>({
  isWatering: true,
  timeRemaining: '14:32',
  tankLevel: 65,
});

export const weeklyScheduleAtom = atom<WeekDay[]>([
  { day: 'L', hasWatering: false },
  { day: 'M', hasWatering: true },
  { day: 'M', hasWatering: false },
  { day: 'J', hasWatering: true },
  { day: 'V', hasWatering: false },
  { day: 'S', hasWatering: true },
  { day: 'D', hasWatering: false },
]);

export const isDarkModeAtom = atom<boolean>(false);

class HomeService {
  private apiBaseUrl: string;
  private useMock: boolean;

  constructor(apiBaseUrl: string = 'http://localhost:3000/api', useMock: boolean = true) {
    this.apiBaseUrl = apiBaseUrl;
    this.useMock = useMock;
  }

  async getTankLevel(): Promise<number> {
    if (this.useMock) {
      await simulateDelay(300);
      const variation = Math.floor(Math.random() * 5) - 2;
      mockAPIData.tankLevel = Math.max(0, Math.min(100, mockAPIData.tankLevel + variation));
      return mockAPIData.tankLevel;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/tank/level`);
      if (!response.ok) throw new Error('Error al obtener nivel del estanque');
      const data = await response.json();
      return data.level;
    } catch (error) {
      console.error('Error en getTankLevel:', error);
      throw error;
    }
  }

  async getWateringStatus(): Promise<{
    isWatering: boolean;
    timeRemaining: string;
  }> {
    if (this.useMock) {
      await simulateDelay(400);
      return mockAPIData.wateringStatus;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/watering/status`);
      if (!response.ok) throw new Error('Error al obtener estado de riego');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en getWateringStatus:', error);
      throw error;
    }
  }

  async getWeeklySchedule(): Promise<MockWeekDay[]> {
    if (this.useMock) {
      await simulateDelay(350);
      return mockAPIData.weeklySchedule;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/schedule/weekly`);
      if (!response.ok) throw new Error('Error al obtener programa semanal');
      const data = await response.json();
      return data.schedule;
    } catch (error) {
      console.error('Error en getWeeklySchedule:', error);
      throw error;
    }
  }

  async toggleWatering(action: 'pause' | 'resume'): Promise<void> {
    if (this.useMock) {
      await simulateDelay(200);
      mockAPIData.wateringStatus.isWatering = action === 'resume';
      console.log(`✓ Riego ${action === 'pause' ? 'pausado' : 'reanudado'} (Mock)`);
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/watering/${action}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error(`Error al ${action === 'pause' ? 'pausar' : 'reanudar'} el riego`);
    } catch (error) {
      console.error('Error en toggleWatering:', error);
      throw error;
    }
  }

  async startManualWatering(duration: number): Promise<void> {
    if (this.useMock) {
      await simulateDelay(250);
      mockAPIData.wateringStatus.isWatering = true;
      mockAPIData.wateringStatus.timeRemaining = formatTime(duration);
      console.log(`✓ Riego manual iniciado por ${duration} minutos (Mock)`);
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/watering/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ duration }),
      });
      if (!response.ok) throw new Error('Error al iniciar riego manual');
    } catch (error) {
      console.error('Error en startManualWatering:', error);
      throw error;
    }
  }

  setMockMode(enabled: boolean): void {
    this.useMock = enabled;
    console.log(`Modo Mock: ${enabled ? 'ACTIVADO' : 'DESACTIVADO'}`);
  }
}

export const homeService = new HomeService('http://localhost:3000/api', false);
