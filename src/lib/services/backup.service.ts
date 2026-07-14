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
import {backupExcel, backupZip} from '../workers/backup.worker';
import {ServiceWithInvoices} from './_service';

export class BackupService extends ServiceWithInvoices<Date> {
  static #instance: BackupService;

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

    const backupFn = async (blob: Blob) => {
      await writeFile(fileHandle, blob);
    };

    await this.backupAndExport({type, settings, backupFn});
  }

  async exportMobileFileSystem(type: 'excel' | 'idb', settings: Settings): Promise<void> {
    const filename = this.filename(type);

    const backupFn = async (blob: Blob) => {
      const dir = await getMobileDir();

      const writeOptions: IWriteOptions = {
        replace: true,
        append: false,
      };

      await File.writeFile(dir.nativeURL, filename, blob, writeOptions);

      await shareMobile(
        `Tie Tracker - Backup - ${format(new Date(), 'yyyy-MM-dd')}`,
        dir.nativeURL,
        filename,
      );
    };

    await this.backupAndExport({type, settings, backupFn});
  }

  async exportDownload(type: 'excel' | 'idb', settings: Settings): Promise<void> {
    const filename = this.filename(type);

    const backupFn = async (blob: Blob) => {
      download(filename, blob);
    };

    await this.backupAndExport({type, settings, backupFn});
  }

  private filename(type: 'excel' | 'idb'): string {
    return `Tie_Tracker-Backup-${format(new Date(), 'yyyy-MM-dd')}.${
      type === 'excel' ? 'xlsx' : 'zip'
    }`;
  }

  private async backupAndExport({
    type,
    settings: {currency, vat, signature},
    backupFn,
  }: {
    type: 'excel' | 'idb';
    settings: Settings;
    backupFn: (blob: Blob) => Promise<void>;
  }) {
    await i18next.loadNamespaces('export');

    const params = {
      currency: currency,
      vat,
      i18n: exportLabels(),
      signature,
    };

    const backup = async () => {
      if (type === 'excel') {
        return await backupExcel(params);
      }

      return await backupZip();
    };

    const result = await backup();

    if (isNullish(result)) {
      return;
    }

    await backupFn(result);
  }
}
