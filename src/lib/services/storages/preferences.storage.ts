import {KeyedStorage} from './storage';
import {Preferences} from '@capacitor/preferences';
import {nonNullish} from '../../utils/utils.nullish';

export class KeyedPreferenceStorage<T> extends KeyedStorage<T> {
  override async get(): Promise<Option<T>> {
    const {value} = await Preferences.get({key: this.key});
    return nonNullish(value) ? JSON.parse(value) as T : undefined;
  }

  override async set(value: T): Promise<void> {
    await Preferences.set({key: this.key, value: JSON.stringify(value)});
  }

  override async del(): Promise<void> {
    await Preferences.remove({key: this.key});
  }
}