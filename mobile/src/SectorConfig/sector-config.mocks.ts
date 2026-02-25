export interface DayConfig {
  day: string;
  label: string;
  active: boolean;
}

export interface SectorConfiguration {
  id: number;
  name: string;
  icon: string;
  isAuto: boolean;
  startTime: string;
  duration: number;
  repeatCycle: boolean;
  days: DayConfig[];
}

export const mockDays: DayConfig[] = [
  { day: 'L', label: 'Lunes', active: false },
  { day: 'M', label: 'Martes', active: true },
  { day: 'X', label: 'Miércoles', active: false },
  { day: 'J', label: 'Jueves', active: true },
  { day: 'V', label: 'Viernes', active: false },
  { day: 'S', label: 'Sábado', active: true },
  { day: 'D', label: 'Domingo', active: false },
];

export const mockSectorConfigs: Record<number, SectorConfiguration> = {
  1: {
    id: 1, name: 'Sector 1: Aguacates', icon: '🌿',
    isAuto: true, startTime: '06:30', duration: 45, repeatCycle: false,
    days: [...mockDays],
  },
  2: {
    id: 2, name: 'Sector 2: Mangos', icon: '🌺',
    isAuto: true, startTime: '07:00', duration: 30, repeatCycle: false,
    days: mockDays.map((d) => ({ ...d, active: d.day === 'L' || d.day === 'J' })),
  },
  3: {
    id: 3, name: 'Sector 3: Pencas', icon: '🪴',
    isAuto: true, startTime: '06:00', duration: 60, repeatCycle: true,
    days: mockDays.map((d) => ({ ...d, active: true })),
  },
  4: {
    id: 4, name: 'Sector 4: Pitayas', icon: '🌱',
    isAuto: false, startTime: '18:00', duration: 20, repeatCycle: false,
    days: mockDays.map((d) => ({ ...d, active: d.day !== 'D' })),
  },
};

export const simulateDelay = (ms = 300): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
