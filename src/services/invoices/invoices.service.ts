import {compareAsc, compareDesc, parse} from 'date-fns';
import {get} from 'idb-keyval';
import {interval} from '../../utils/utils.date';
import {emitError} from '../../utils/utils.events';

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

  async listProjectsInvoices(updateStateFunction: Function): Promise<void> {
    this.invoicesWorker.onmessage = ($event: MessageEvent) => {
      if ($event && $event.data) {
        updateStateFunction($event.data);
      }
    };

    this.invoicesWorker.postMessage({msg: 'listProjectsInvoices'});
  }

  async listProjectInvoice(
    updateStateFunction: Function,
    projectId: string,
    from: Date,
    to: Date,
  ): Promise<void> {
    const invoices = interval(from, to);

    if (invoices === undefined) {
      return;
    }

    this.invoicesWorker.onmessage = ($event: MessageEvent) => {
      if ($event && $event.data) {
        updateStateFunction($event.data.length > 0 ? $event.data[0] : undefined);
      }
    };

    this.invoicesWorker.postMessage({
      msg: 'listProjectInvoice',
      invoices: invoices,
      projectId: projectId,
    });
  }

  async closeInvoices({
    from,
    to,
    done,
  }: {
    from: Date;
    to: Date;
    done: (success: boolean) => Promise<void>;
  }) {
    this.invoicesWorker.onmessage = async ($event: MessageEvent) => {
      if ($event.data?.result === 'error') {
        emitError($event.data.msg);
      }

      await done($event.data?.result === 'success');
    };

    this.invoicesWorker.postMessage({
      msg: `close-invoices`,
      data: {from, to},
    });
  }

  async period(): Promise<InvoicesPeriod | undefined> {
    try {
      const invoices = await get('invoices');

      if (!invoices || invoices.length <= 0) {
        return undefined;
      }

      const min = invoices.reduce((a: string, b: string) => {
        const aDate: Date = parse(a, 'yyyy-MM-dd', new Date());
        const bDate: Date = parse(b, 'yyyy-MM-dd', new Date());

        return compareAsc(aDate, bDate) <= 0 ? a : b;
      });

      const max = invoices.reduce((a: string, b: string) => {
        const aDate: Date = parse(a, 'yyyy-MM-dd', new Date());
        const bDate: Date = parse(b, 'yyyy-MM-dd', new Date());

        return compareDesc(aDate, bDate) <= 0 ? a : b;
      });

      return {
        from: parse(min, 'yyyy-MM-dd', new Date()),
        to: parse(max, 'yyyy-MM-dd', new Date()),
      };
    } catch (err) {
      return undefined;
    }
  }
}
