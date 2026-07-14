import {File, IWriteOptions} from '@awesome-cordova-plugins/file';
import {isPlatform} from '@ionic/react';
import {differenceInWeeks, format} from 'date-fns';
import i18next from 'i18next';
import {isTest} from '../env';
import type {Settings} from '../types/settings';
import {exportLabels} from '../utils/utils.export';
import {
  download,
  getMobileDir,
  getNewFileHandle,
  shareMobile,
  writeFile,
} from '../utils/utils.filesystem';
import {isNullish, nonNullish} from '../utils/utils.nullish';
import {ServiceWithInvoices} from './_service';

export class BackupService extends ServiceWithInvoices<Date> {
  static #instance: BackupService;

  #backupWorker = new Worker('./workers/backup.js');

  private constructor() {
    super({key: 'backup'});
  }

  static getInstance() {
    if (isNullish(BackupService.#instance)) {
      BackupService.#instance = new BackupService();
    }
    return BackupService.#instance;
  }

  async needBackup(): Promise<boolean> {
    try {
      const invoices = await this.getInvoices();

      if (isNullish(invoices) || invoices.length <= 0) {
        return false;
      }

      const lastBackup = await this.get();

      if (nonNullish(lastBackup) && differenceInWeeks(new Date(), lastBackup) > 0) {
        return true;
      }

      return isNullish(lastBackup);
    } catch (_err: unknown) {
      return false;
    }
  }

  async setBackup() {
    await this.set(new Date());
  }

  async backup(type: 'excel' | 'idb', settings: Settings) {
    if (isTest()) {
      // Playwright does not support File System API?
      await this.exportDownload(type, settings);
    } else if (isPlatform('hybrid')) {
      await this.exportMobileFileSystem(type, settings);
    } else if ('showSaveFilePicker' in window) {
      await this.exportNativeFileSystem(type, settings);
    } else {
      await this.exportDownload(type, settings);
    }

    await this.setBackup();
  }

  async exportNativeFileSystem(type: 'excel' | 'idb', settings: Settings): Promise<void> {
    const fileHandle = await getNewFileHandle(type === 'excel' ? 'xlsx' : 'zip');

    if (isNullish(fileHandle)) {
      throw new Error('Cannot access filesystem.');
    }

    this.#backupWorker.onmessage = async ($event: MessageEvent) => {
      if (nonNullish($event.data)) {
        await writeFile(fileHandle, $event.data);
      }
    };

    await this.postMessage(type, settings);
  }

  async exportMobileFileSystem(type: 'excel' | 'idb', settings: Settings): Promise<void> {
    const filename = this.filename(type);

    this.#backupWorker.onmessage = async ($event: MessageEvent) => {
      if (nonNullish($event.data)) {
        const dir = await getMobileDir();

        const writeOptions: IWriteOptions = {
          replace: true,
          append: false,
        };

        await File.writeFile(dir.nativeURL, filename, $event.data, writeOptions);

        await shareMobile(
          `Tie Tracker - Backup - ${format(new Date(), 'yyyy-MM-dd')}`,
          dir.nativeURL,
          filename,
        );
      }
    };

    await this.postMessage(type, settings);
  }

  async exportDownload(type: 'excel' | 'idb', settings: Settings): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const filename = this.filename(type);

        this.#backupWorker.onmessage = ($event: MessageEvent) => {
          if (nonNullish($event.data)) {
            download(filename, $event.data);
          }

          resolve();
        };

        await this.postMessage(type, settings);
      } catch (err: unknown) {
        reject(err);
      }
    });
  }

  private filename(type: 'excel' | 'idb'): string {
    return `Tie_Tracker-Backup-${format(new Date(), 'yyyy-MM-dd')}.${
      type === 'excel' ? 'xlsx' : 'zip'
    }`;
  }

  private async postMessage(type: 'excel' | 'idb', {currency, vat, signature}: Settings) {
    await i18next.loadNamespaces('export');

    this.#backupWorker.postMessage({
      msg: `backup-${type}`,
      currency: currency,
      vat,
      i18n: exportLabels(),
      signature,
    });
  }
}
