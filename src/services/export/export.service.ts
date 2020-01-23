import {isPlatform} from '@ionic/react';

import {format} from 'date-fns';

import i18next from 'i18next';

import {interval} from '../../utils/utils.date';

import {Invoice} from '../../store/interfaces/invoice';

import {SocialSharing } from '@ionic-native/social-sharing';
import {File, IWriteOptions, DirectoryEntry} from '@ionic-native/file';

import {Currency} from '../../definitions/currency';

export class ExportService {

    private static instance: ExportService;

    private exportWorker: Worker = new Worker('./workers/export.js');

    private constructor() {
        // Private constructor, singleton
    }

    static getInstance() {
        if (!ExportService.instance) {
            ExportService.instance = new ExportService();
        }
        return ExportService.instance;
    }

    exportNativeFileSystem(invoice: Invoice, from: Date | undefined, to: Date | undefined, currency: Currency, vat: number | undefined, bill: boolean): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            if (invoice === undefined || invoice.project_id === undefined) {
                reject('No invoice data.');
                return;
            }

            const invoices: string[] | undefined = interval(from, to);

            if (invoices === undefined) {
                reject('No invoices to export.');
                return;
            }

            try {
                const filename: string = this.filename(invoice, from, to);
                const fileHandle: FileSystemFileHandle = await this.getNewFileHandle(filename);

                if (!fileHandle) {
                    reject('Cannot access filesystem.');
                    return;
                }

                this.exportWorker.onmessage = async ($event: MessageEvent) => {
                    if ($event && $event.data) {
                        this.writeFile(fileHandle, $event.data);
                    }
                };

                await this.postMessage(invoice, invoices, currency, vat, bill);

                resolve();
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    }

    exportDownload(invoice: Invoice, from: Date | undefined, to: Date | undefined, currency: Currency, vat: number | undefined, bill: boolean): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            if (invoice === undefined || invoice.project_id === undefined) {
                reject('No invoice data.');
                return;
            }

            const invoices: string[] | undefined = interval(from, to);

            if (invoices === undefined) {
                reject('No invoices to export.');
                return;
            }

            try {
                const filename: string = this.filename(invoice, from, to);

                this.exportWorker.onmessage = async ($event: MessageEvent) => {
                    if ($event && $event.data) {
                        this.download(filename, $event.data);
                    }
                };

                await this.postMessage(invoice, invoices, currency, vat, bill);

                resolve();
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    }

    exportMobileFileSystem(invoice: Invoice, from: Date | undefined, to: Date | undefined, currency: Currency, vat: number | undefined, bill: boolean): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            if (invoice === undefined || invoice.project_id === undefined) {
                reject('No invoice data.');
                return;
            }

            const invoices: string[] | undefined = interval(from, to);

            if (invoices === undefined) {
                reject('No invoices to export.');
                return;
            }

            try {
                const filename: string = this.filename(invoice, from, to);

                this.exportWorker.onmessage = async ($event: MessageEvent) => {
                    if ($event && $event.data) {
                        const dir: DirectoryEntry = await this.getMobileDir();

                        const writeOptions: IWriteOptions = {
                            replace: true,
                            append: false
                        };

                        await File.writeFile(dir.nativeURL, filename, $event.data, writeOptions);

                        await this.shareMobile(invoice, dir.nativeURL, filename);
                    }
                };

                await this.postMessage(invoice, invoices, currency, vat, bill);

                resolve();
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    }

    private async getNewFileHandle(filename: string): Promise<FileSystemFileHandle> {
        const opts: ChooseFileSystemEntriesOptions = {
            type: 'saveFile',
            accepts: [{
                description: filename,
                extensions: ['xlsx'],
                mimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
            }],
        };

        return chooseFileSystemEntries(opts);
    }

    private async writeFile(fileHandle: FileSystemFileHandle, contents: string | BufferSource | Blob) {
        // Create a writer (request permission if necessary).
        const writer = await fileHandle.createWriter();
        // Write the full length of the contents
        await writer.write(0, contents);
        // Close the file and write the contents to disk
        await writer.close();
    }

    // https://stackoverflow.com/a/19328891/5404186
    private download(filename: string, data: string) {
        const a: HTMLAnchorElement = document.createElement('a');
        a.style.display = 'none';
        document.body.appendChild(a);

        const blob: Blob = new Blob([data], {type: 'octet/stream'});
        const url: string = window.URL.createObjectURL(blob);

        a.href = url;
        a.download = filename;

        a.click();

        window.URL.revokeObjectURL(url);

        if (a && a.parentElement) {
            a.parentElement.removeChild(a);
        }
    }

    private filename(invoice: Invoice, from: Date | undefined, to: Date | undefined): string {
        const name: string = invoice.client && invoice.client.name ? invoice.client.name : 'export';
        return `${name}${from ? '-' + format(from, 'yyyy-MM-dd') : ''}${to ? '-' + format(to, 'yyyy-MM-dd') : ''}.xlsx`
    }

    private getMobileDir(): Promise<DirectoryEntry> {
        return new Promise<DirectoryEntry>(async (resolve, reject) => {
            try {
                const rootDir: DirectoryEntry = await File.resolveDirectoryUrl(isPlatform('ios') ? File.syncedDataDirectory : File.dataDirectory);

                rootDir.getDirectory('tietracker', {create: true}, (newDir: DirectoryEntry) => {
                    resolve(newDir);
                }, (err) => {
                    reject(new Error('Directory not found or not created.'));
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    private shareMobile(invoice: Invoice, path: string, filename: string): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                await SocialSharing.shareWithOptions({
                    subject: this.shareSubject(invoice),
                    files: [`${path}/${filename}`],
                    chooserTitle: 'Pick an app'
                });

                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    private shareSubject(invoice: Invoice): string {
        return `Tie Tracker${invoice.client && invoice.client.name ? ` - ${invoice.client.name}` : ''}`
    }

    private async postMessage(invoice: Invoice, invoices: string[], currency: Currency, vat: number | undefined, bill: boolean) {

        await i18next.loadNamespaces('export');

        this.exportWorker.postMessage({
            msg: 'export',
            invoices: invoices,
            projectId: invoice.project_id,
            client: invoice.client,
            currency: currency,
            vat: vat,
            bill: bill,
            i18n: {
                total: i18next.t('export:total'),
                billable_subtotal: i18next.t('export:billable_subtotal'),
                vat_rate: i18next.t('export:vat_rate'),
                vat: i18next.t('export:vat'),
                total_vat_excluded: i18next.t('export:total_vat_excluded'),
                total_billable_hours: i18next.t('export:total_billable_hours'),
                description: i18next.t('export:description'),
                start_date: i18next.t('export:start_date'),
                start_time: i18next.t('export:start_time'),
                end_date: i18next.t('export:end_date'),
                end_time: i18next.t('export:end_time'),
                duration: i18next.t('export:duration'),
                billable: i18next.t('export:billable')
            }
        });
    }
}
