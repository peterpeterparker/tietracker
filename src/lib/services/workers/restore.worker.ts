import JSZip from 'jszip';
import {PREFERENCES_KEYS} from '../../constants';
import {Result} from '../../utils/utils.fn';
import {nonNullish} from '../../utils/utils.nullish';
import {FilesystemStorage} from '../storages/filesystem.storage';
import {PreferencesStorage} from '../storages/preferences.storage';

export const restore = async (args: {zip: Blob}): Promise<Result<undefined>> => {
  try {
    await clear();
    await restoreData(args);

    return {status: 'success', result: undefined};
  } catch (err: unknown) {
    return {status: 'error', err};
  }
};

const restoreData = async ({zip: data}: {zip: Blob}): Promise<void> => {
  const zip = new JSZip();

  const contents = await zip.loadAsync(data);

  const files = Object.keys(contents.files);

  const storageEntries: [string, unknown][] = [];
  const preferencesEntries: [string, unknown][] = [];

  for (const filename of files) {
    const content = await zip.file(filename)?.async('text');

    if (nonNullish(content)) {
      const key = filename.replace('.json', '');

      if (PREFERENCES_KEYS.includes(key)) {
        preferencesEntries.push([
          key,
          filename === 'backup.json'
            ? new Date(JSON.parse(content)).toISOString()
            : JSON.parse(content),
        ]);
      } else {
        storageEntries.push([key, JSON.parse(content)]);
      }
    }
  }

  if (storageEntries.length > 0) {
    const storage = new FilesystemStorage();
    await storage.setMany(storageEntries);
  }

  if (preferencesEntries.length > 0) {
    const preferences = new PreferencesStorage();
    await preferences.setMany(preferencesEntries);
  }
};

const clear = async () => {
  const storage = new FilesystemStorage();
  await storage.clear();

  const preferences = new PreferencesStorage();
  await preferences.clear();
};
