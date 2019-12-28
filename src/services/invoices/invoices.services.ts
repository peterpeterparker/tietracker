import {get} from 'idb-keyval';

import {compareAsc, compareDesc, eachDayOfInterval, format, isAfter, parse} from 'date-fns';

export interface InvoicesPeriod {
    from: Date;
    to: Date;
}

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

            this.invoicesWorker.postMessage({msg: 'listProjectsInvoices'});

            resolve();
        });
    }

    listProjectInvoice(updateStateFunction: Function, projectId: string, from: Date, to: Date): Promise<void> {
        return new Promise<void>((resolve) => {
            if (!from || !to || isAfter(from, to)) {
                resolve();
                return;
            }

            this.invoicesWorker.onmessage = ($event: MessageEvent) => {
                if ($event && $event.data) {
                    updateStateFunction($event.data.length > 0 ? $event.data[0] : undefined);
                }
            };

            const days: Date[] = eachDayOfInterval({start: from, end: to});
            const invoices: string[] = days.map((day: Date) => {
                return format(day, 'yyyy-MM-dd');
            });

            this.invoicesWorker.postMessage({msg: 'listProjectInvoice', invoices: invoices, projectId: projectId});

            resolve();
        });
    }

    period(): Promise<InvoicesPeriod | undefined> {
        return new Promise<InvoicesPeriod | undefined>(async (resolve) => {
            try {
                const invoices: string[] = await get('invoices');

                if (!invoices || invoices.length <= 0) {
                    resolve(undefined);
                    return;
                }

                const min: string = invoices.reduce((a: string, b: string) => {
                    const aDate: Date = parse(a, 'yyyy-MM-dd', new Date());
                    const bDate: Date = parse(b, 'yyyy-MM-dd', new Date());

                    return compareAsc(aDate, bDate) <= 0 ? a : b;
                });

                const max: string = invoices.reduce((a: string, b: string) => {
                    const aDate: Date = parse(a, 'yyyy-MM-dd', new Date());
                    const bDate: Date = parse(b, 'yyyy-MM-dd', new Date());

                    return compareDesc(aDate, bDate) <= 0 ? a : b;
                });

                resolve({
                    from: parse(min, 'yyyy-MM-dd', new Date()),
                    to: parse(max, 'yyyy-MM-dd', new Date()),
                })
            } catch (err) {
                resolve(undefined);
            }
        });
    }
}
