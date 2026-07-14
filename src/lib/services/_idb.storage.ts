import {del, get, set} from 'idb-keyval';
import {KeyedStorage} from './_storage';

export class KeyedIdbStorage<T> extends KeyedStorage<T> {
  override get(): Promise<Option<T>> {
    return get<T>(this.key);
  }

  override async set(value: T): Promise<void> {
    await set(this.key, value);
  }

  override async del(): Promise<void> {
    await del(this.key);
  }
}
