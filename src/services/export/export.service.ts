import {interval} from '../../utils/utils.date';

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

    export(projectId: string, from: Date | undefined, to: Date | undefined, currency: string): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const invoices: string[] | undefined = interval(from, to);

            if (invoices === undefined) {
                reject('No invoices to export.');
                return;
            }

            try {
                const fileHandle: FileSystemFileHandle = await this.getNewFileHandle();

                if (!fileHandle) {
                    reject('Cannot access filesystem.');
                    return;
                }

                const writer = await fileHandle.createWriter();

                // TODO

                this.exportWorker.onmessage = async ($event: MessageEvent) => {
                    console.log(writer);

                    if ($event && $event.data) {
                        await writer.write(0, $event.data);
                    } else {
                        await writer.close();
                    }

                };

                this.exportWorker.postMessage({
                    msg: 'export',
                    invoices: invoices,
                    projectId: projectId,
                    currency: currency
                });

                resolve();
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    }

    private async getNewFileHandle(): Promise<FileSystemFileHandle> {
        const opts: ChooseFileSystemEntriesOptions = {
            type: 'saveFile',
            accepts: [{
                description: 'Export',
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
}
