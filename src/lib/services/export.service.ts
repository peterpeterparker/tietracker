import {File, IWriteOptions} from '@awesome-cordova-plugins/file';
import {format} from 'date-fns';
import i18next from 'i18next';
import {Invoice} from '../store/interfaces/invoice';
import type {Currency} from '../types/currency';
import {DateString} from '../types/date';
import {interval} from '../utils/utils.date';
import {exportLabels} from '../utils/utils.export';
import {
  download,
  getMobileDir,
  getNewFileHandle,
  shareMobile,
  writeFile,
} from '../utils/utils.filesystem';
import {isNullish} from '../utils/utils.nullish';
import {exportInvoices} from '../workers/export.worker';

export class ExportService {
  static #instance: ExportService;

  private constructor() {}

  static getInstance() {
    if (isNullish(ExportService.#instance)) {
      ExportService.#instance = new ExportService();
    }
    return ExportService.#instance;
  }

  async exportNativeFileSystem(
    invoice: Invoice,
    from: Date | undefined,
    to: Date | undefined,
    currency: Currency,
    vat: number | undefined,
    bill: boolean,
    signature: string | undefined,
  ): Promise<void> {
    if (isNullish(invoice?.project_id)) {
      throw new Error('No invoice data.');
    }

    const invoices = interval(from, to);

    if (isNullish(invoices)) {
      throw new Error('No invoices to export.');
    }

    const fileHandle = await getNewFileHandle('xlsx');

    if (isNullish(fileHandle)) {
      throw new Error('Cannot access filesystem.');
    }

    const exportFn = async (blob: Blob) => {
      await writeFile(fileHandle, blob);
    };

    await this.export({
      invoice,
      invoices: invoices as DateString[],
      currency,
      vat,
      bill,
      signature,
      exportFn,
    });
  }

  async exportDownload(
    invoice: Invoice,
    from: Date | undefined,
    to: Date | undefined,
    currency: Currency,
    vat: number | undefined,
    bill: boolean,
    signature: string | undefined,
  ): Promise<void> {
    if (isNullish(invoice?.project_id)) {
      throw new Error('No invoice data.');
    }

    const invoices = interval(from, to);

    if (isNullish(invoices)) {
      throw new Error('No invoices to export.');
    }

    const filename = this.filename(invoice, from, to, 'xlsx');

    const exportFn = async (blob: Blob) => {
      download(filename, blob);
    };

    await this.export({
      invoice,
      invoices: invoices as DateString[],
      currency,
      vat,
      bill,
      signature,
      exportFn,
    });
  }

  async exportMobileFileSystem(
    invoice: Invoice,
    from: Date | undefined,
    to: Date | undefined,
    currency: Currency,
    vat: number | undefined,
    bill: boolean,
    signature: string | undefined,
  ): Promise<void> {
    if (isNullish(invoice?.project_id)) {
      throw new Error('No invoice data.');
    }

    const invoices = interval(from, to);

    if (isNullish(invoices)) {
      throw new Error('No invoices to export.');
    }

    const filename = this.filename(invoice, from, to, 'xlsx');

    const exportFn = async (blob: Blob) => {
      const dir = await getMobileDir();

      const writeOptions: IWriteOptions = {
        replace: true,
        append: false,
      };

      await File.writeFile(dir.nativeURL, filename, blob, writeOptions);

      await shareMobile(this.shareSubject(invoice), dir.nativeURL, filename);
    };

    await this.export({
      invoice,
      invoices: invoices as DateString[],
      currency,
      vat,
      bill,
      signature,
      exportFn,
    });
  }

  private shareSubject(invoice: Invoice): string {
    return `Tie Tracker${invoice.client && invoice.client.name ? ` - ${invoice.client.name}` : ''}`;
  }

  private filename(
    invoice: Invoice,
    from: Date | undefined,
    to: Date | undefined,
    type: 'xlsx',
  ): string {
    const name = invoice.client && invoice.client.name ? invoice.client.name : 'export';
    return `${name}${from ? '-' + format(from, 'yyyy-MM-dd') : ''}${
      to ? '-' + format(to, 'yyyy-MM-dd') : ''
    }.${type}`;
  }

  private async export({
    exportFn,
    ...rest
  }: {
    invoice: Invoice;
    invoices: DateString[];
    currency: Currency;
    vat: number | undefined;
    bill: boolean;
    signature: string | undefined;
    exportFn: (blob: Blob) => Promise<void>;
  }) {
    await i18next.loadNamespaces('export');

    const result = await exportInvoices({...rest, i18n: exportLabels()});

    if (isNullish(result)) {
      return;
    }

    await exportFn(result);
  }
}
