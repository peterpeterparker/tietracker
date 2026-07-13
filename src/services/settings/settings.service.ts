import {get, set} from 'idb-keyval';
import {Settings} from '../../models/settings';

// Source MIT: https://github.com/xsolla/currency-format
export interface Currency {
  name: string;
  fractionSize: number;
  symbol: {
    grapheme: string;
    template: string;
    rtl: boolean;
  };
  uniqSymbol: boolean;
}

export interface Currencies {
  [currency: string]: Currency;
}

export class SettingsService {
  private static instance: SettingsService;

  private constructor() {
    // Private constructor, singleton
  }

  static getInstance() {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  async init(): Promise<Settings> {
    try {
      let settings = await get<Settings>('settings');

      if (!settings) {
        settings = this.getDefaultSettings();

        await set('settings', settings);
      }

      return settings;
    } catch (_err: unknown) {
      return this.getDefaultSettings();
    }
  }

  getDefaultSettings(): Settings {
    const now: Date = new Date();
    return {
      currency: {
        currency: 'CHF',
        format: {
          name: 'Swiss Franc',
          fractionSize: 2,
          symbol: null,
          uniqSymbol: null,
        },
      },
      roundTime: 5,
      descriptions: ['Development', 'Meeting', 'Test', 'Communication', 'Release'],
      notifications: true,
      backup: true,
      created_at: now.getTime(),
      updated_at: now.getTime(),
    };
  }

  async currencies(): Promise<Currencies | undefined> {
    try {
      const res = await fetch('./assets/currency/currency.json');

      if (!res || !res.ok) {
        return undefined;
      }

      const currencies: Currencies = await res.json();

      return currencies;
    } catch (_err: unknown) {
      return undefined;
    }
  }

  async update(settings: Settings): Promise<Settings> {
    if (!settings) {
      throw new Error('Settings not defined.');
    }

    settings.updated_at = new Date().getTime();

    await set('settings', settings);

    return settings;
  }
}
