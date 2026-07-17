import JSZip from 'jszip';
import {PREFERENCES_KEYS} from '../../constants';
import {Settings} from '../../types/settings';
import {Result} from '../../utils/utils.fn';
import {nonNullish} from '../../utils/utils.nullish';
import {directory} from '../helpers/settings.helper';
import {FilesystemStorage} from '../storages/filesystem.storage';
import {PreferencesStorage} from '../storages/preferences.storage';

export const restore = async ({
  zip,
  settings,
}: {
  zip: Blob;
  settings: Settings;
}): Promise<Result<undefined>> => {
  try {
    await clear({settings});
    await restoreData({settings, zip});

    return {status: 'success', result: undefined};
  } catch (err: unknown) {
    return {status: 'error', err};
  }
};

const restoreData = async ({
  zip: data,
  settings,
}: {
  zip: Blob;
  settings: Settings;
}): Promise<void> => {
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
    const storage = new FilesystemStorage({
      ...directory(settings),
    });
    await storage.setMany(storageEntries);
  }

  if (preferencesEntries.length > 0) {
    const preferences = new PreferencesStorage();
    await preferences.setMany(preferencesEntries);
  }
};

const clear = async ({settings}: {settings: Settings}) => {
  const storage = new FilesystemStorage({
    ...directory(settings),
  });
  await storage.clear();

  const preferences = new PreferencesStorage();
  await preferences.clear();
};
