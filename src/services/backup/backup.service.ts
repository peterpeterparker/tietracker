import {isPlatform} from '@ionic/react';

import {get, set} from 'idb-keyval';

import {differenceInWeeks, format} from 'date-fns';

import i18next from 'i18next';

import {DirectoryEntry, File, IWriteOptions} from '@ionic-native/file';

import {download, getMobileDir, getNewFileHandle, shareMobile, writeFile} from '../../utils/utils.filesystem';
import {xlsxLabels} from '../../utils/utils.export';
import {isChrome, isHttps} from '../../utils/utils.platform';

import {Currency} from '../../definitions/currency';

import {Settings} from '../../models/settings';

export class BackupService {
  private static instance: BackupService;

  private backupWorker: Worker = new Worker('./workers/backup.js');

  private constructor() {
    // Private constructor, singleton
  }

  static getInstance() {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  needBackup(): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      try {
        const invoices: string[] = await get('invoices');

        if (!invoices || invoices.length <= 0) {
          resolve(false);
          return;
        }

        const lastBackup: Date = await get('backup');

        if (lastBackup && differenceInWeeks(new Date(), lastBackup) > 0) {
          resolve(true);
          return;
        }

        resolve(lastBackup === undefined);
      } catch (err) {
        resolve(false);
      }
    });
  }

  async setBackup() {
    await set('backup', new Date());
  }

  async backup(settings: Settings) {
    if (isPlatform('desktop') && isChrome() && isHttps()) {
      await this.exportNativeFileSystem(settings.currency, settings.vat);
    } else if (isPlatform('hybrid')) {
      await this.exportMobileFileSystem(settings.currency, settings.vat);
    } else {
      await this.exportDownload(settings.currency, settings.vat);
    }

    await this.setBackup();
  }

  exportNativeFileSystem(currency: Currency, vat: number | undefined): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const filename: string = this.filename();
        const fileHandle: FileSystemFileHandle = await getNewFileHandle(filename);

        if (!fileHandle) {
          reject('Cannot access filesystem.');
          return;
        }

        this.backupWorker.onmessage = async ($event: MessageEvent) => {
          if ($event && $event.data) {
            await writeFile(fileHandle, $event.data);
          }
        };

        await this.postMessage(currency, vat);

        resolve();
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  exportMobileFileSystem(currency: Currency, vat: number | undefined): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const filename: string = this.filename();

        this.backupWorker.onmessage = async ($event: MessageEvent) => {
          if ($event && $event.data) {
            const dir: DirectoryEntry = await getMobileDir();

            const writeOptions: IWriteOptions = {
              replace: true,
              append: false,
            };

            await File.writeFile(dir.nativeURL, filename, $event.data, writeOptions);

            await shareMobile(`Tie Tracker - Backup - ${format(new Date(), 'yyyy-MM-dd')}`, dir.nativeURL, filename);
          }
        };

        await this.postMessage(currency, vat);

        resolve();
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  exportDownload(currency: Currency, vat: number | undefined): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const filename: string = this.filename();

        this.backupWorker.onmessage = async ($event: MessageEvent) => {
          if ($event && $event.data) {
            download(filename, $event.data);
          }
        };

        await this.postMessage(currency, vat);

        resolve();
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  private filename(): string {
    return `Tie_Tracker-Backup-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  }

  private async postMessage(currency: Currency, vat: number | undefined) {
    await i18next.loadNamespaces('export');

    this.backupWorker.postMessage({
      msg: 'backup',
      currency: currency,
      vat: vat,
      i18n: xlsxLabels(),
    });
  }
}
