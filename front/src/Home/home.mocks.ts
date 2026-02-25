

export interface MockTankStatus {
  isWatering: boolean;
  timeRemaining: string;
  tankLevel: number;
}

export interface MockWeekDay {
  day: string;
  hasWatering: boolean;
}

export interface MockAPIResponse {
  tankLevel: number;
  wateringStatus: {
    isWatering: boolean;
    timeRemaining: string;
  };
  weeklySchedule: MockWeekDay[];
}

export const mockTankStatus: MockTankStatus = {
  isWatering: true,
  timeRemaining: '14:32',
  tankLevel: 65,
};

export const mockWeeklySchedule: MockWeekDay[] = [
  { day: 'L', hasWatering: false },
  { day: 'M', hasWatering: true },
  { day: 'M', hasWatering: false },
  { day: 'J', hasWatering: true },
  { day: 'V', hasWatering: false },
  { day: 'S', hasWatering: true },
  { day: 'D', hasWatering: false },
];

export const mockAPIData: MockAPIResponse = {
  tankLevel: 65,
  wateringStatus: {
    isWatering: true,
    timeRemaining: '14:32',
  },
  weeklySchedule: mockWeeklySchedule,
};

export const simulateDelay = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const generateRandomTankLevel = (): number => {
  return Math.floor(Math.random() * (100 - 30 + 1)) + 30;
};

export const formatTime = (minutes: number): string => {
  const mins = Math.floor(minutes);
  const secs = Math.floor((minutes - mins) * 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
