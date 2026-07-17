import {
  Directory,
  Encoding,
  type FileInfo,
  Filesystem,
  PluginError,
  type ReadFileOptions,
  type WriteFileOptions,
} from '@capacitor/filesystem';
import {nonNullish} from '../../utils/utils.nullish';
import {KeyedStorage, Storage} from './storage';
import {isNotNativePlatform} from '../../env';

// TODO: option Directory.Library or Directory.LibraryNoCloud
const DIRECTORY: Directory = Directory.Library;

const ENCODING: Pick<ReadFileOptions, 'encoding'> | Pick<WriteFileOptions, 'encoding'> = {
  encoding: Encoding.UTF8,
};

const STORAGE_DIR_PATH = '__storage__';

const filePath = (key: string): string => `${STORAGE_DIR_PATH}/${key}.json`;

// https://capacitorjs.com/docs/apis/filesystem#errors
const FILE_NOT_FOUND_ERROR_CODE = 'OS-PLUG-FILE-0008';
const DIRECTORY_ALREADY_EXISTS_ERROR_CODE = 'OS-PLUG-FILE-0010';

const isPluginError = (err: unknown): err is PluginError =>
  nonNullish(err) &&
  typeof err === 'object' &&
  'code' in err &&
  typeof (err as PluginError).code === 'string';

const isNotFoundError = (err: unknown): boolean =>
  isNotNativePlatform() || (isPluginError(err) && err.code === FILE_NOT_FOUND_ERROR_CODE);

const isDirectoryAlreadyExistsError = (err: unknown): boolean =>
  isNotNativePlatform() || (isPluginError(err) && err.code === DIRECTORY_ALREADY_EXISTS_ERROR_CODE);

const get = async <T>(key: string): Promise<Option<T>> => {
  try {
    const {data} = await Filesystem.readFile({
      ...ENCODING,
      path: filePath(key),
      directory: DIRECTORY,
    });

    const text = data instanceof Blob ? await data.text() : data;

    return JSON.parse(text) as T;
  } catch (err: unknown) {
    if (isNotFoundError(err)) {
      return undefined;
    }

    throw err;
  }
};

const ensureDataDirExists = async (): Promise<void> => {
  const createDataDir = async () => {
    try {
      await Filesystem.mkdir({
        path: STORAGE_DIR_PATH,
        directory: DIRECTORY,
        recursive: true,
      });
    } catch (err: unknown) {
      if (isDirectoryAlreadyExistsError(err)) {
        return;
      }

      throw err;
    }
  };

  try {
    await Filesystem.stat({
      path: STORAGE_DIR_PATH,
      directory: DIRECTORY,
    });
  } catch {
    // stat rejects if the path does not exist yet.
    await createDataDir();
  }
};

const set = async (key: string, value: unknown): Promise<void> => {
  await ensureDataDirExists();

  await Filesystem.writeFile({
    ...ENCODING,
    path: filePath(key),
    directory: DIRECTORY,
    data: JSON.stringify(value),
  });
};

const listFiles = async (): Promise<{files: FileInfo[]}> => {
  try {
    return await Filesystem.readdir({
      path: STORAGE_DIR_PATH,
      directory: DIRECTORY,
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
        path: STORAGE_DIR_PATH,
        directory: DIRECTORY,
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
    // Sequential set instead of promises to reduce stress in case the target directory has to be created
    for (const [key, value] of entries) {
      await set(key, value);
    }
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
        directory: DIRECTORY,
      });
    } catch (err: unknown) {
      if (isNotFoundError(err)) {
        return;
      }

      throw err;
    }
  }
}
