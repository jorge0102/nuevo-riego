export interface MockSector {
  id: number;
  name: string;
  icon: string;
  isActive: boolean;
  isAuto: boolean;
  color: 'primary' | 'secondary';
}

export interface MockScheduleData {
  tankLevel: number;
  sectors: MockSector[];
}

export const mockSectors: MockSector[] = [
  { id: 1, name: 'Sector 1: Aguacates', icon: '🌿', isActive: true, isAuto: true, color: 'secondary' },
  { id: 2, name: 'Sector 2: Mangos', icon: '🌺', isActive: false, isAuto: true, color: 'primary' },
  { id: 3, name: 'Sector 3: Pencas', icon: '🪴', isActive: false, isAuto: true, color: 'primary' },
  { id: 4, name: 'Sector 4: Pitayas', icon: '🌱', isActive: true, isAuto: false, color: 'secondary' },
];

export const mockScheduleData: MockScheduleData = {
  tankLevel: 75,
  sectors: mockSectors,
};

export const simulateDelay = (ms = 300): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
