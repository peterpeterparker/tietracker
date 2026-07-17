import {clear, del, get, listFiles, set} from './helpers/filesystem.helper';
import {KeyedStorage, Storage} from './storage';

export class FilesystemStorage extends Storage {
  override async entries(): Promise<[string, unknown][]> {
    const {files} = await listFiles();

    const jsonFiles = files.filter((file) => file.name.endsWith('.json'));

    const entries = await Promise.all(
      jsonFiles.map(async (file): Promise<[string, unknown]> => {
        const key = file.name.replace(/\.json$/, '');
        const value = await get({key});
        return [key, value];
      }),
    );

    return entries;
  }

  override async clear(): Promise<void> {
    await clear();
  }

  override async setMany(entries: [string, unknown][]): Promise<void> {
    // Sequential set instead of promises to reduce stress in case the target directory has to be created
    for (const [key, value] of entries) {
      await set({key, value});
    }
  }
}

export class KeyedFilesystemStorage<T> extends KeyedStorage<T> {
  override get(): Promise<Option<T>> {
    return get<T>({key: this.key});
  }

  override async set(value: T): Promise<void> {
    await set({key: this.key, value});
  }

  override async del(): Promise<void> {
    await del({key: this.key});
  }
}
