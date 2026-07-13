import {File, IWriteOptions} from '@awesome-cordova-plugins/file';
import {isPlatform} from '@ionic/react';
import {differenceInWeeks, format} from 'date-fns';
import i18next from 'i18next';
import {get, set} from 'idb-keyval';
import type {Settings} from '../types/settings';
import {exportLabels} from '../utils/utils.export';
import {
  download,
  getMobileDir,
  getNewFileHandle,
  shareMobile,
  writeFile,
} from '../utils/utils.filesystem';

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

  async needBackup(): Promise<boolean> {
    try {
      const invoices = await get('invoices');

      if (!invoices || invoices.length <= 0) {
        return false;
      }

      const lastBackup = await get('backup');

      if (lastBackup && differenceInWeeks(new Date(), lastBackup) > 0) {
        return true;
      }

      return lastBackup === undefined;
    } catch (_err: unknown) {
      return false;
    }
  }

  async setBackup() {
    await set('backup', new Date());
  }

  async backup(type: 'excel' | 'idb', settings: Settings) {
    if (isPlatform('hybrid')) {
      await this.exportMobileFileSystem(type, settings);
    } else if ('showSaveFilePicker' in window) {
      await this.exportNativeFileSystem(type, settings);
    } else {
      await this.exportDownload(type, settings);
    }

    await this.setBackup();
  }

  async exportNativeFileSystem(type: 'excel' | 'idb', settings: Settings): Promise<void> {
    const fileHandle: FileSystemFileHandle = await getNewFileHandle(
      type === 'excel' ? 'xlsx' : 'zip',
    );

    if (!fileHandle) {
      throw new Error('Cannot access filesystem.');
    }

    this.backupWorker.onmessage = async ($event: MessageEvent) => {
      if ($event && $event.data) {
        await writeFile(fileHandle, $event.data);
      }
    };

    await this.postMessage(type, settings);
  }

  async exportMobileFileSystem(type: 'excel' | 'idb', settings: Settings): Promise<void> {
    const filename = this.filename(type);

    this.backupWorker.onmessage = async ($event: MessageEvent) => {
      if ($event && $event.data) {
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
    const filename = this.filename(type);

    this.backupWorker.onmessage = ($event: MessageEvent) => {
      if ($event && $event.data) {
        download(filename, $event.data);
      }
    };

    await this.postMessage(type, settings);
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
