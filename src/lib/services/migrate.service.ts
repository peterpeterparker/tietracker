import {Preferences} from '@capacitor/preferences';
import {Result, safeExec} from '../utils/utils.fn';
import {nonNullish} from '../utils/utils.nullish';
import {FilesystemStorage} from './storages/filesystem.storage';
import {IdbStorage} from './storages/idb.storage';

const MIGRATION_FLAG_KEY = 'migrate-idb-to-filesystem';

type MigrateIdbToFilesystemResult =
  Result<undefined> | {status: 'skipped'} | {status: 'clear_error'; err: unknown};

type MigrateIdbToFilesystemStatus = 'skipped' | 'success' | 'success_with_clear_error' | 'error';

/**
 * TODO: to be removed in a future version
 */
export class MigrateService {
  async migrateIdbToFilesystem(args: {
    onMigrate: (status: 'start' | 'end') => void;
  }): Promise<Result<void>> {
    return await safeExec(async () => {
      await this.assertAndMigrate(args);
    });
  }

  async assertAndMigrate({
    onMigrate,
  }: {
    onMigrate: (status: 'start' | 'end') => void;
  }): Promise<void> {
    const {value} = await Preferences.get({key: MIGRATION_FLAG_KEY});

    if (nonNullish(value)) {
      return;
    }

    onMigrate('start');

    const result = await this.migrate();

    onMigrate('end');

    switch (result.status) {
      case 'skipped':
        await this.saveMigrateStatus({status: 'skipped'});
        return;
      case 'success':
        await this.saveMigrateStatus({status: 'success'});
        return;
      case 'clear_error':
        await this.saveMigrateStatus({status: 'success_with_clear_error'});
        break;
      case 'error':
        await this.saveMigrateStatus({status: 'error'});
    }

    throw result.err;
  }

  async saveMigrateStatus({status: value}: {status: MigrateIdbToFilesystemStatus}): Promise<void> {
    await Preferences.set({key: MIGRATION_FLAG_KEY, value});
  }

  async migrate(): Promise<MigrateIdbToFilesystemResult> {
    const idbStorage = new IdbStorage();

    const entries = await idbStorage.entries();

    if (entries.length <= 0) {
      return {status: 'skipped'};
    }

    try {
      const filesystemStorage = new FilesystemStorage();
      await filesystemStorage.setMany(entries);
    } catch (err: unknown) {
      return {status: 'error', err};
    }

    try {
      await idbStorage.clear();
    } catch (err: unknown) {
      return {status: 'clear_error', err};
    }

    return {status: 'success', result: undefined};
  }
}
