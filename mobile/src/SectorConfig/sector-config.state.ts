import { atom } from 'jotai';
import { mockSectorConfigs, simulateDelay, type SectorConfiguration } from './sector-config.mocks';

export type { SectorConfiguration };
export { type DayConfig } from './sector-config.mocks';

export const sectorConfigAtom = atom<SectorConfiguration | null>(null);

class SectorConfigService {
  private apiBaseUrl: string;
  private useMock: boolean;

  constructor(apiBaseUrl = 'http://localhost:3000/api', useMock = true) {
    this.apiBaseUrl = apiBaseUrl;
    this.useMock = useMock;
  }

  async getSectorConfig(sectorId: number): Promise<SectorConfiguration> {
    if (this.useMock) {
      await simulateDelay();
      return mockSectorConfigs[sectorId] || mockSectorConfigs[1];
    }
    const response = await fetch(`${this.apiBaseUrl}/sectors/${sectorId}/config`);
    if (!response.ok) throw new Error('Error al obtener configuración');
    return response.json();
  }

  async saveSectorConfig(config: SectorConfiguration): Promise<void> {
    if (this.useMock) {
      await simulateDelay(400);
      mockSectorConfigs[config.id] = config;
      return;
    }
    const response = await fetch(`${this.apiBaseUrl}/sectors/${config.id}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!response.ok) throw new Error('Error al guardar configuración');
  }
}

export const sectorConfigService = new SectorConfigService('http://localhost:3000/api', true);
