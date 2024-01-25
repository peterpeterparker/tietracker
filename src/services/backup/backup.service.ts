import {isPlatform} from '@ionic/react';

import {get, set} from 'idb-keyval';

import {differenceInWeeks, format} from 'date-fns';

import i18next from 'i18next';

import {DirectoryEntry, File, IWriteOptions} from '@awesome-cordova-plugins/file';

import {exportLabels} from '../../utils/utils.export';
import {
  download,
  getMobileDir,
  getNewFileHandle,
  shareMobile,
  writeFile,
} from '../../utils/utils.filesystem';
import {isChrome, isHttps} from '../../utils/utils.platform';

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
        const invoices: string[] | undefined = await get('invoices');

        if (!invoices || invoices.length <= 0) {
          resolve(false);
          return;
        }

        const lastBackup: Date | undefined = await get('backup');

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

  async backup(type: 'excel' | 'idb', settings: Settings) {
    if (isPlatform('desktop') && isChrome() && isHttps()) {
      await this.exportNativeFileSystem(type, settings);
    } else if (isPlatform('hybrid')) {
      await this.exportMobileFileSystem(type, settings);
    } else {
      await this.exportDownload(type, settings);
    }

    await this.setBackup();
  }

  exportNativeFileSystem(type: 'excel' | 'idb', settings: Settings): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const fileHandle: FileSystemFileHandle = await getNewFileHandle(
          type === 'excel' ? 'xlsx' : 'zip',
        );

        if (!fileHandle) {
          reject('Cannot access filesystem.');
          return;
        }

        this.backupWorker.onmessage = async ($event: MessageEvent) => {
          if ($event && $event.data) {
            await writeFile(fileHandle, $event.data);
          }
        };

        await this.postMessage(type, settings);

        resolve();
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  exportMobileFileSystem(type: 'excel' | 'idb', settings: Settings): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const filename: string = this.filename(type);

        this.backupWorker.onmessage = async ($event: MessageEvent) => {
          if ($event && $event.data) {
            const dir: DirectoryEntry = await getMobileDir();

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

        resolve();
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  exportDownload(type: 'excel' | 'idb', settings: Settings): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const filename: string = this.filename(type);

        this.backupWorker.onmessage = async ($event: MessageEvent) => {
          if ($event && $event.data) {
            download(filename, $event.data);
          }
        };

        await this.postMessage(type, settings);

        resolve();
      } catch (err) {
        console.error(err);
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

    this.backupWorker.postMessage({
      msg: `backup-${type}`,
      currency: currency,
      vat,
      i18n: exportLabels(),
      signature,
    });
  }
}
