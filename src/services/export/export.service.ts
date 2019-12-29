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
        return new Promise<void>((resolve) => {
            const invoices: string[] | undefined = interval(from, to);

            if (invoices === undefined) {
                resolve();
                return;
            }

            this.exportWorker.onmessage = ($event: MessageEvent) => {
                console.log($event);
            };

            this.exportWorker.postMessage({msg: 'export', invoices: invoices, projectId: projectId, currency: currency});

            resolve();
        });
    }
}
