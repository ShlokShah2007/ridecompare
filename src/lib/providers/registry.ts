import { BaseProviderAdapter } from './base-adapter';
import { UberAdapter } from './uber-adapter';
import { RapidoAdapter } from './rapido-adapter';
import { OlaAdapter } from './ola-adapter';
import { NammaYatriAdapter } from './namma-yatri-adapter';
import { BluSmartAdapter } from './blusmart-adapter';
import { Provider, ProviderId } from '../types';

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private adapters: Map<ProviderId, BaseProviderAdapter> = new Map();

  private constructor() {
    this.register(new UberAdapter());
    this.register(new RapidoAdapter());
    this.register(new OlaAdapter());
    this.register(new NammaYatriAdapter());
    this.register(new BluSmartAdapter());
  }

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  public register(adapter: BaseProviderAdapter): void {
    this.adapters.set(adapter.providerId, adapter);
  }

  public getAdapter(id: ProviderId): BaseProviderAdapter | undefined {
    return this.adapters.get(id);
  }

  public getAllAdapters(): BaseProviderAdapter[] {
    return Array.from(this.adapters.values());
  }

  public async getProvidersList(): Promise<Provider[]> {
    const list: Provider[] = [];
    for (const adapter of Array.from(this.adapters.values())) {
      const status = await adapter.getProviderStatus();
      list.push({
        id: adapter.providerId,
        name: adapter.name,
        shortName: adapter.shortName,
        logo: adapter.logo,
        badgeColor: adapter.color,
        enabled: true,
        apiStatus: status.status,
        statusMessage: status.message,
        supportedCategories: adapter.supportedCategories,
        description: adapter.description,
      });
    }
    return list;
  }
}
