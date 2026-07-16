import {clear, del, entries, get, set, setMany} from 'idb-keyval';
import {KeyedStorage, Storage} from './storage';

/**
 * @deprecated use FilesystemStorage
 */
export class IdbStorage extends Storage {
  override entries(): Promise<[string, unknown][]> {
    return entries();
  }

  override async clear(): Promise<void> {
    await clear();
  }

  override async setMany(entries: [string, unknown][]): Promise<void> {
    await setMany(entries);
  }
}

/**
 * @deprecated use KeyedFilesystemStorage
 */
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
