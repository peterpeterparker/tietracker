import {File, IWriteOptions} from '@awesome-cordova-plugins/file';
import {format} from 'date-fns';
import i18next from 'i18next';
import {Invoice} from '../store/interfaces/invoice';
import type {Currency} from '../types/currency';
import {interval} from '../utils/utils.date';
import {exportLabels} from '../utils/utils.export';
import {
  download,
  getMobileDir,
  getNewFileHandle,
  shareMobile,
  writeFile,
} from '../utils/utils.filesystem';
import {isNullish, nonNullish} from '../utils/utils.nullish';

export class ExportService {
  static #instance: ExportService;

  #exportWorker = new Worker('./workers/export.js');

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

    this.#exportWorker.onmessage = async ($event: MessageEvent) => {
      if (nonNullish($event?.data)) {
        await writeFile(fileHandle, $event.data);
      }
    };

    await this.postMessage(invoice, invoices, currency, vat, bill, signature);
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

    this.#exportWorker.onmessage = async ($event: MessageEvent) => {
      if (nonNullish($event?.data)) {
        download(filename, $event.data);
      }
    };

    await this.postMessage(invoice, invoices, currency, vat, bill, signature);
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

    this.#exportWorker.onmessage = async ($event: MessageEvent) => {
      if (nonNullish($event?.data)) {
        const dir = await getMobileDir();

        const writeOptions: IWriteOptions = {
          replace: true,
          append: false,
        };

        await File.writeFile(dir.nativeURL, filename, $event.data, writeOptions);

        await shareMobile(this.shareSubject(invoice), dir.nativeURL, filename);
      }
    };

    await this.postMessage(invoice, invoices, currency, vat, bill, signature);
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

  private async postMessage(
    invoice: Invoice,
    invoices: string[],
    currency: Currency,
    vat: number | undefined,
    bill: boolean,
    signature: string | undefined,
  ) {
    await i18next.loadNamespaces('export');

    this.#exportWorker.postMessage({
      msg: 'export',
      invoices: invoices,
      projectId: invoice.project_id,
      client: invoice.client,
      currency: currency,
      vat: vat,
      bill: bill,
      i18n: exportLabels(),
      signature,
    });
  }
}
