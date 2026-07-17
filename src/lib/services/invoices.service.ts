import {compareAsc, compareDesc, parse} from 'date-fns';
import {KEYS} from '../constants';
import {Invoice} from '../store/interfaces/invoice';
import {DateString} from '../types/date';
import {Settings} from '../types/settings';
import {interval} from '../utils/utils.date';
import {emitError} from '../utils/utils.events';
import {isNullish} from '../utils/utils.nullish';
import {StorageService} from './_storage.service';
import {closeInvoices, listProjectInvoice, listProjectsInvoices} from './workers/billable.worker';

export interface InvoicesPeriod {
  from: Date;
  to: Date;
}

export class InvoicesService extends StorageService<DateString[]> {
  #invoicesSettings: Pick<Settings, 'iOS'>;

  private constructor(args: Pick<Settings, 'iOS'>) {
    super({...args, key: KEYS.filesystem.invoices});

    this.#invoicesSettings = args;
  }

  static create(args: Pick<Settings, 'iOS'>) {
    return new InvoicesService(args);
  }

  async listProjectsInvoices(updateStateFunction: (data: Invoice[]) => void): Promise<void> {
    const data = await listProjectsInvoices({settings: this.#invoicesSettings});
    updateStateFunction(data);
  }

  async listProjectInvoice(
    updateStateFunction: (data: Option<Invoice>) => void,
    projectId: string,
    from: Date,
    to: Date,
  ): Promise<void> {
    const invoices = interval(from, to);

    if (isNullish(invoices)) {
      return;
    }

    const data = await listProjectInvoice({
      invoices: invoices as DateString[],
      projectId,
      settings: this.#invoicesSettings,
    });

    updateStateFunction(data);
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
    const result = await closeInvoices({from, to, settings: this.#invoicesSettings});

    if (result.status === 'error') {
      emitError(
        result.err instanceof Error
          ? result.err.message
          : 'Unexpected error while closing invoices',
      );
    }

    await done(result.status === 'success');
  }

  async period(): Promise<Option<InvoicesPeriod>> {
    try {
      const invoices = await this.get();

      if (isNullish(invoices) || invoices.length <= 0) {
        return undefined;
      }

      const min = invoices.reduce((a, b) => {
        const aDate: Date = parse(a, 'yyyy-MM-dd', new Date());
        const bDate: Date = parse(b, 'yyyy-MM-dd', new Date());

        return compareAsc(aDate, bDate) <= 0 ? a : b;
      });

      const max = invoices.reduce((a, b) => {
        const aDate: Date = parse(a, 'yyyy-MM-dd', new Date());
        const bDate: Date = parse(b, 'yyyy-MM-dd', new Date());

        return compareDesc(aDate, bDate) <= 0 ? a : b;
      });

      return {
        from: parse(min, 'yyyy-MM-dd', new Date()),
        to: parse(max, 'yyyy-MM-dd', new Date()),
      };
    } catch (_err: unknown) {
      return undefined;
    }
  }
}
