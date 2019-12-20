export class InvoicesService {

    private static instance: InvoicesService;

    private invoicesWorker: Worker = new Worker('./workers/billable.js');

    private constructor() {
        // Private constructor, singleton
    }

    static getInstance() {
        if (!InvoicesService.instance) {
            InvoicesService.instance = new InvoicesService();
        }
        return InvoicesService.instance;
    }

    listProjectsInvoices(updateStateFunction: Function): Promise<void> {
        return new Promise<void>((resolve) => {
            this.invoicesWorker.onmessage = ($event: MessageEvent) => {
                if ($event && $event.data) {
                    updateStateFunction($event.data);
                }
            };

            this.invoicesWorker.postMessage('listProjectsInvoices');

            resolve();
        });
    }

}