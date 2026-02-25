

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
  {
    id: 1,
    name: 'Sector 1: Front Lawn',
    icon: 'yard',
    isActive: true,
    isAuto: true,
    color: 'secondary',
  },
  {
    id: 2,
    name: 'Sector 2: Flower Beds',
    icon: 'local_florist',
    isActive: false,
    isAuto: true,
    color: 'primary',
  },
  {
    id: 3,
    name: 'Sector 3: Veggie Patch',
    icon: 'potted_plant',
    isActive: false,
    isAuto: true,
    color: 'primary',
  },
  {
    id: 4,
    name: 'Sector 4: Backyard',
    icon: 'grass',
    isActive: true,
    isAuto: false,
    color: 'secondary',
  },
];

export const mockScheduleData: MockScheduleData = {
  tankLevel: 75,
  sectors: mockSectors,
};

export const simulateDelay = (ms: number = 300): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
