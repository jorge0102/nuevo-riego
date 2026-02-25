
import { atom } from 'jotai';
import { mockSectorConfigs, simulateDelay, type DayConfig, type SectorConfiguration } from './sector-config.mocks';

export type { SectorConfiguration, DayConfig };

export const sectorConfigAtom = atom<SectorConfiguration | null>(null);

class SectorConfigService {
  private apiBaseUrl: string;
  private useMock: boolean;

  constructor(apiBaseUrl: string = 'http://localhost:3000/api', useMock: boolean = true) {
    this.apiBaseUrl = apiBaseUrl;
    this.useMock = useMock;
  }

  async getSectorConfig(sectorId: number): Promise<SectorConfiguration> {
    if (this.useMock) {
      await simulateDelay();
      return mockSectorConfigs[sectorId] || mockSectorConfigs[1];
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/sectors/${sectorId}/config`);
      if (!response.ok) throw new Error('Error al obtener configuración del sector');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en getSectorConfig:', error);
      throw error;
    }
  }

  async saveSectorConfig(config: SectorConfiguration): Promise<void> {
    if (this.useMock) {
      await simulateDelay(400);
      mockSectorConfigs[config.id] = config;
      console.log('✓ Configuración guardada (Mock):', config);
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/sectors/${config.id}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error('Error al guardar configuración');
    } catch (error) {
      console.error('Error en saveSectorConfig:', error);
      throw error;
    }
  }

  setMockMode(enabled: boolean): void {
    this.useMock = enabled;
    console.log(`Modo Mock: ${enabled ? 'ACTIVADO' : 'DESACTIVADO'}`);
  }
}

export const sectorConfigService = new SectorConfigService('http://localhost:3000/api', false);
