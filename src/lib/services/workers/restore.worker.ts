import JSZip from 'jszip';
import {Result} from '../../utils/utils.fn';
import {nonNullish} from '../../utils/utils.nullish';
import {FilesystemStorage} from '../storages/filesystem.storage';

export const restore = async (args: {zip: Blob}): Promise<Result<undefined>> => {
  try {
    await cleanStorage();
    await restoreStorage(args);

    return {status: 'success', result: undefined};
  } catch (err: unknown) {
    return {status: 'error', err};
  }
};

const restoreStorage = async ({zip: data}: {zip: Blob}): Promise<void> => {
  const zip = new JSZip();

  const contents = await zip.loadAsync(data);

  const files = Object.keys(contents.files);

  const dbKeysData: [string, unknown][] = [];
  for (const filename of files) {
    const content = await zip.file(filename)?.async('text');

    if (nonNullish(content)) {
      dbKeysData.push([
        filename.replace('.json', ''),
        filename === 'backup.json' ? Date.parse(JSON.parse(content)) : JSON.parse(content),
      ]);
    }
  }

  const storage = new FilesystemStorage();
  await storage.setMany(dbKeysData);
};

const cleanStorage = async () => {
  const storage = new FilesystemStorage();
  await storage.clear();
};
