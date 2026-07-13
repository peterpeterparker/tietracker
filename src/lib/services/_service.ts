import {DateString} from '../types/date';
import {IdbStorage} from './_idb.storage';
import {Storage} from './_storage';

export abstract class Service<T> {
  readonly #storage: Storage<T>;

  protected constructor({key}: {key: string}) {
    this.#storage = new IdbStorage<T>({key});
  }

  get(): Promise<Option<T>> {
    return this.#storage.get();
  }

  async set(value: T): Promise<void> {
    await this.#storage.set(value);
  }
}

export abstract class ServiceWithInvoices<T> extends Service<T> {
  readonly #invoicesStorage: Storage<DateString[]>;

  protected constructor(args: {key: string}) {
    super(args);

    this.#invoicesStorage = new IdbStorage<DateString[]>({key: 'invoices'});
  }

  getInvoices(): Promise<Option<DateString[]>> {
    return this.#invoicesStorage.get();
  }
}
