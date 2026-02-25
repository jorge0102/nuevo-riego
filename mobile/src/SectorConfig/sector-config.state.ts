import { atom } from 'jotai';
import { apiFetch } from '../config/api';
import type { SectorConfiguration } from './sector-config.mocks';

export type { SectorConfiguration };
export { type DayConfig } from './sector-config.mocks';

export const sectorConfigAtom = atom<SectorConfiguration | null>(null);

class SectorConfigService {
  async getSectorConfig(sectorId: number): Promise<SectorConfiguration> {
    const res = await apiFetch('/sectors/' + sectorId + '/config');
    return res.json();
  }

  async saveSectorConfig(config: SectorConfiguration): Promise<void> {
    await apiFetch('/sectors/' + config.id + '/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }
}

export const sectorConfigService = new SectorConfigService();
