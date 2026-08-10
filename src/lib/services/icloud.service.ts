import type {Settings} from '../types/settings';
import {emitError} from '../utils/utils.events';
import {Result} from '../utils/utils.fn';
import {migrateIOSDirectory} from './workers/icloud.worker';

export class ICloudService {
  static create() {
    return new ICloudService();
  }

  async migrate({
    currentSettings,
    updateSettingsFn,
    done,
  }: {
    currentSettings: Settings;
    updateSettingsFn: (settings: Settings) => Promise<void>;
    done: (success: boolean) => Promise<void>;
  }) {
    const targetSettings: Settings = {
      ...currentSettings,
      iOS: {
        iCloudSync: currentSettings.iOS?.iCloudSync === false,
      },
    };

    const migrateResult = await migrateIOSDirectory({
      currentSettings,
      targetSettings,
    });

    if (migrateResult.status === 'error') {
      emitError(
        migrateResult.err instanceof Error
          ? migrateResult.err.message
          : 'Unexpected error while migrating the iCloud sync directory',
      );

      await done(false);
      return;
    }

    const saveSettings = async (): Promise<Result<undefined>> => {
      try {
        await updateSettingsFn(targetSettings);

        return {status: 'success', result: undefined};
      } catch (err: unknown) {
        return {status: 'error', err};
      }
    };

    const saveResult = await saveSettings();

    if (saveResult.status === 'error') {
      emitError(saveResult.err);
      console.error(saveResult.err);

      await done(false);
      return;
    }

    await done(true);
  }
}
