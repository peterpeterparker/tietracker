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

  init(): Promise<Settings> {
    return new Promise<Settings>(async (resolve) => {
      try {
        let settings: Settings = await get('settings');

        if (!settings) {
          settings = this.getDefaultSettings();

          await set('settings', settings);
        }

        resolve(settings);
      } catch (err) {
        resolve(this.getDefaultSettings());
      }
    });
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

  currencies(): Promise<Currencies | undefined> {
    return new Promise<Currencies | undefined>(async (resolve) => {
      try {
        const res: Response = await fetch('./assets/currency/currency.json');

        if (!res) {
          resolve(undefined);
          return;
        }

        const currencies: Currencies = await res.json();

        resolve(currencies);
      } catch (err) {
        resolve(undefined);
      }
    });
  }

  update(settings: Settings): Promise<Settings> {
    return new Promise<Settings>(async (resolve, reject) => {
      try {
        if (!settings) {
          reject('Settings not defined.');
          return;
        }

        settings.updated_at = new Date().getTime();

        await set('settings', settings);

        resolve(settings);
      } catch (err) {
        reject(err);
      }
    });
  }
}
