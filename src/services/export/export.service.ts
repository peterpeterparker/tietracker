import {interval} from '../../utils/utils.date';

import {Invoice} from '../../store/interfaces/invoice';
import {format} from 'date-fns';

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

    exportNativeFileSystem(invoice: Invoice, from: Date | undefined, to: Date | undefined, currency: string): Promise<void> {
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

                this.exportWorker.postMessage({
                    msg: 'export',
                    invoices: invoices,
                    projectId: invoice.project_id,
                    currency: currency
                });

                resolve();
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    }

    exportDownload(invoice: Invoice, from: Date | undefined, to: Date | undefined, currency: string): Promise<void> {
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

                this.exportWorker.postMessage({
                    msg: 'export',
                    invoices: invoices,
                    projectId: invoice.project_id,
                    currency: currency
                });

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
                extensions: ['csv'],
                mimeTypes: ['text/csv'],
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
        return `${name}${from ? '-' + format(from, 'yyyy-MM-dd') : ''}${to ? '-' + format(to, 'yyyy-MM-dd') : ''}.csv`
    }
}
