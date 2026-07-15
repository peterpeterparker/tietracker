import {Directory, Encoding, FileInfo, Filesystem, PluginError} from '@capacitor/filesystem';
import {KeyedStorage, Storage} from './storage';
import {nonNullish} from '../../utils/utils.nullish';
import {Capacitor} from '@capacitor/core';

const DATA_DIR = 'tietracker';

const filePath = (key: string): string => `${DATA_DIR}/${key}.json`;

// https://capacitorjs.com/docs/apis/filesystem#errors
const FILE_NOT_FOUND_ERROR_CODE = 'OS-PLUG-FILE-0008';

const isPluginError = (err: unknown): err is PluginError => nonNullish(err) &&
  typeof err === 'object' &&
  'code' in err &&
  typeof (err as PluginError).code === 'string';

const isNotFoundError = (err: unknown): boolean =>
  !Capacitor.isNativePlatform() || (isPluginError(err) && err.code === FILE_NOT_FOUND_ERROR_CODE);


const get = async <T>(key: string): Promise<Option<T>> => {
  try {
    const {data} = await Filesystem.readFile({
      path: filePath(key),
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });

    const text = data instanceof Blob ? await data.text() : data;

    return JSON.parse(text) as T;
  } catch (err: unknown) {
    if (isNotFoundError(err)) {
      return;
    }

    throw err;
  }
};

const ensureDataDirExists = async (): Promise<void> => {
  try {
    await Filesystem.stat({
      path: DATA_DIR,
      directory: Directory.Data,
    });
  } catch {
    // stat rejects if the path does not exist yet.
    await Filesystem.mkdir({
      path: DATA_DIR,
      directory: Directory.Data,
      recursive: true,
    });
  }
};

const set = async (key: string, value: unknown): Promise<void> => {
  await ensureDataDirExists();

  await Filesystem.writeFile({
    path: filePath(key),
    directory: Directory.Data,
    encoding: Encoding.UTF8,
    data: JSON.stringify(value),
  });
};

const listFiles = async (): Promise<{files: FileInfo[]}> => {
  try {
    return await Filesystem.readdir({
      path: DATA_DIR,
      directory: Directory.Data,
    });
  } catch (err: unknown) {
    if (isNotFoundError(err)) {
      return {files: []};
    }

    throw err;
  }
};

export class FilesystemStorage extends Storage {
  override async entries(): Promise<[string, unknown][]> {
    const {files} = await listFiles();

    const jsonFiles = files.filter((file) => file.name.endsWith('.json'));

    const entries = await Promise.all(
      jsonFiles.map(async (file): Promise<[string, unknown]> => {
        const key = file.name.replace(/\.json$/, '');
        const value = await get(key);
        return [key, value];
      }),
    );

    return entries;
  }

  override async clear(): Promise<void> {
    try {
      await Filesystem.rmdir({
        path: DATA_DIR,
        directory: Directory.Data,
        recursive: true,
      });
    } catch (err: unknown) {
      if (isNotFoundError(err)) {
        return;
      }

      throw err;
    }
  }

  override async setMany(entries: [string, unknown][]): Promise<void> {
    await Promise.all(entries.map(([key, value]) => set(key, value)));
  }
}

export class KeyedFilesystemStorage<T> extends KeyedStorage<T> {
  override get(): Promise<Option<T>> {
    return get<T>(this.key);
  }

  override async set(value: T): Promise<void> {
    await set(this.key, value);
  }

  override async del(): Promise<void> {
    try {
      await Filesystem.deleteFile({
        path: filePath(this.key),
        directory: Directory.Data,
      });
    } catch (err: unknown) {
      if (isNotFoundError(err)) {
        return;
      }

      throw err;
    }
  }
}

