import {Preferences} from '@capacitor/preferences';
import {nonNullish} from '../../utils/utils.nullish';
import {KeyedStorage, Storage} from './storage';

export class PreferencesStorage extends Storage {
  override async entries(): Promise<[string, unknown][]> {
    const {keys} = await Preferences.keys();

    return await Promise.all(
      keys.map(async (key): Promise<[string, unknown]> => {
        const {value} = await Preferences.get({key});
        return [key, nonNullish(value) ? JSON.parse(value) : undefined];
      }),
    );
  }

  override async clear(): Promise<void> {
    await Preferences.clear();
  }

  override async setMany(entries: [string, unknown][]): Promise<void> {
    for (const [key, value] of entries) {
      await Preferences.set({key, value: JSON.stringify(value)});
    }
  }
}

export class KeyedPreferencesStorage<T> extends KeyedStorage<T> {
  override async get(): Promise<Option<T>> {
    const {value} = await Preferences.get({key: this.key});
    return nonNullish(value) ? (JSON.parse(value) as T) : undefined;
  }

  override async set(value: T): Promise<void> {
    await Preferences.set({key: this.key, value: JSON.stringify(value)});
  }

  override async del(): Promise<void> {
    await Preferences.remove({key: this.key});
  }
}
