
import { atom } from 'jotai';
import { apiFetch } from '../config/api';
import { mockSectorConfigs, type DayConfig, type SectorConfiguration } from './sector-config.mocks';

export type { SectorConfiguration, DayConfig };

export const sectorConfigAtom = atom<SectorConfiguration | null>(null);

class SectorConfigService {
  async getSectorConfig(sectorId: number): Promise<SectorConfiguration> {
    try {
      const res = await apiFetch(`/sectors/${sectorId}/config`);
      return res.json();
    } catch {
      return mockSectorConfigs[sectorId] ?? mockSectorConfigs[1];
    }
  }

  async saveSectorConfig(config: SectorConfiguration): Promise<void> {
    try {
      await apiFetch(`/sectors/${config.id}/config`, {
        method: 'PUT',
        body: JSON.stringify(config),
      });
    } catch { /* guardar en memoria ya actualizado por setConfig */ }
  }
}

export const sectorConfigService = new SectorConfigService();
