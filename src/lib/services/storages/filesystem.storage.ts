import {Directory} from '@capacitor/filesystem';
import {clear, del, get, listFiles, set} from './helpers/filesystem.helper';
import {KeyedStorage, Storage} from './storage';

const DEFAULT_DIRECTORY: Directory = Directory.Library;

export class FilesystemStorage extends Storage {
  readonly #directory: Directory;

  constructor({directory}: {directory: Directory} = {directory: DEFAULT_DIRECTORY}) {
    super();

    this.#directory = directory;
  }

  override async entries(): Promise<[string, unknown][]> {
    const {files} = await listFiles(this.directory());

    const jsonFiles = files.filter((file) => file.name.endsWith('.json'));

    const entries = await Promise.all(
      jsonFiles.map(async (file): Promise<[string, unknown]> => {
        const key = file.name.replace(/\.json$/, '');
        const value = await get({key, ...this.directory()});
        return [key, value];
      }),
    );

    return entries;
  }

  override async clear(): Promise<void> {
    await clear(this.directory());
  }

  override async setMany(entries: [string, unknown][]): Promise<void> {
    // Sequential set instead of promises to reduce stress in case the target directory has to be created
    for (const [key, value] of entries) {
      await set({key, value, ...this.directory()});
    }
  }

  private directory(): {directory: Directory} {
    return {directory: this.#directory};
  }
}

export class KeyedFilesystemStorage<T> extends KeyedStorage<T> {
  readonly #directory: Directory;

  constructor({key, directory = DEFAULT_DIRECTORY}: {key: string; directory?: Directory}) {
    super({key});

    this.#directory = directory;
  }

  override get(): Promise<Option<T>> {
    return get<T>({key: this.key, ...this.directory()});
  }

  override async set(value: T): Promise<void> {
    await set({key: this.key, value, ...this.directory()});
  }

  override async del(): Promise<void> {
    await del({key: this.key, ...this.directory()});
  }

  private directory(): {directory: Directory} {
    return {directory: this.#directory};
  }
}
