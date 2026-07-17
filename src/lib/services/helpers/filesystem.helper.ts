import {
  Directory,
  Encoding,
  type FileInfo,
  Filesystem,
  PluginError,
  type ReadFileOptions,
  type WriteFileOptions,
} from '@capacitor/filesystem';
import {isNotNativePlatform} from '../../env';
import {nonNullish} from '../../utils/utils.nullish';

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

export const get = async <T>({
  key,
  directory,
}: {
  key: string;
  directory: Directory;
}): Promise<Option<T>> => {
  try {
    const {data} = await Filesystem.readFile({
      ...ENCODING,
      path: filePath(key),
      directory,
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

export const ensureDataDirExists = async ({directory}: {directory: Directory}): Promise<void> => {
  const createDataDir = async () => {
    try {
      await Filesystem.mkdir({
        path: STORAGE_DIR_PATH,
        directory,
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
      directory,
    });
  } catch {
    // stat rejects if the path does not exist yet.
    await createDataDir();
  }
};

export const set = async ({
  key,
  value,
  directory,
}: {
  key: string;
  value: unknown;
  directory: Directory;
}): Promise<void> => {
  await ensureDataDirExists({directory});

  await Filesystem.writeFile({
    ...ENCODING,
    path: filePath(key),
    directory,
    data: JSON.stringify(value),
  });
};

export const listFiles = async ({
  directory,
}: {
  directory: Directory;
}): Promise<{files: FileInfo[]}> => {
  try {
    return await Filesystem.readdir({
      path: STORAGE_DIR_PATH,
      directory,
    });
  } catch (err: unknown) {
    if (isNotFoundError(err)) {
      return {files: []};
    }

    throw err;
  }
};

export const clear = async ({directory}: {directory: Directory}): Promise<void> => {
  try {
    await Filesystem.rmdir({
      path: STORAGE_DIR_PATH,
      directory,
      recursive: true,
    });
  } catch (err: unknown) {
    if (isNotFoundError(err)) {
      return;
    }

    throw err;
  }
};

export const del = async ({key, directory}: {key: string; directory: Directory}): Promise<void> => {
  try {
    await Filesystem.deleteFile({
      path: filePath(key),
      directory,
    });
  } catch (err: unknown) {
    if (isNotFoundError(err)) {
      return;
    }

    throw err;
  }
};
