import {Settings} from '../../types/settings';
import {Result} from '../../utils/utils.fn';
import {directory} from '../helpers/settings.helper';
import {FilesystemStorage} from '../storages/filesystem.storage';

export const migrateIOSDirectory = async ({
  currentSettings,
  targetSettings,
}: {
  currentSettings: Pick<Settings, 'iOS'>;
  targetSettings: Pick<Settings, 'iOS'>;
}): Promise<Result<undefined>> => {
  // Source directory for the current settings
  const sourceStorage = new FilesystemStorage({
    ...directory(currentSettings),
  });
  const sourceStorageEntries = await sourceStorage.entries();

  const copyResult = await copyEntries({
    entries: sourceStorageEntries,
    targetSettings,
  });

  if (copyResult.status === 'error') {
    return copyResult;
  }

  const clearResult = await clearSourceEntries({sourceStorage});

  if (clearResult.status === 'error') {
    return clearResult;
  }

  return {status: 'success', result: undefined};
};

const copyEntries = async ({
  entries,
  targetSettings,
}: {
  entries: [string, unknown][];
  targetSettings: Pick<Settings, 'iOS'>;
}): Promise<Result<undefined>> => {
  try {
    // Target directory use the target directory with or without iCloud (contrary of current)
    const targetStorage = new FilesystemStorage({
      ...directory(targetSettings),
    });

    // Clear target - just in case - and copy over all entries
    await targetStorage.clear();
    await targetStorage.setMany(entries);

    return {status: 'success', result: undefined};
  } catch (err: unknown) {
    return {status: 'error', err};
  }
};

const clearSourceEntries = async ({
  sourceStorage,
}: {
  sourceStorage: FilesystemStorage;
}): Promise<Result<undefined>> => {
  try {
    // Finally clear source directory
    await sourceStorage.clear();

    return {status: 'success', result: undefined};
  } catch (err: unknown) {
    return {status: 'error', err};
  }
};
