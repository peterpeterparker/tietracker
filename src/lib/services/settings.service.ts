import type {Settings} from '../types/settings';
import {isNullish} from '../utils/utils.nullish';
import {StorageService} from './_storage.service';

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

export class SettingsService extends StorageService<Settings> {
  static #instance: SettingsService;

  private constructor() {
    super({key: 'settings'});
  }

  static getInstance() {
    if (isNullish(SettingsService.#instance)) {
      SettingsService.#instance = new SettingsService();
    }
    return SettingsService.#instance;
  }

  async init(): Promise<Settings> {
    try {
      let settings = await this.get();

      if (isNullish(settings)) {
        settings = this.getDefaultSettings();

        await this.set(settings);
      }

      return settings;
    } catch (_err: unknown) {
      return this.getDefaultSettings();
    }
  }

  getDefaultSettings(): Settings {
    const now = new Date();

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

  async currencies(): Promise<Option<Currencies>> {
    try {
      const res = await fetch('./assets/currency/currency.json');

      if (isNullish(res) || !res.ok) {
        return undefined;
      }

      const currencies: Currencies = await res.json();

      return currencies;
    } catch (_err: unknown) {
      return undefined;
    }
  }

  async update(settings: Settings): Promise<Settings> {
    settings.updated_at = new Date().getTime();

    await this.set(settings);

    return settings;
  }
}
