import {del, get, set} from 'idb-keyval';
import {Storage} from './_storage';

export class IdbStorage<T> extends Storage<T> {
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
