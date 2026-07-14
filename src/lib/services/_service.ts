import {KeyedIdbStorage} from '../storages/idb.storage';
import {KeyedStorage} from '../storages/storage';
import {DateString} from '../types/date';
import {ProjectId} from '../types/project';

export abstract class Service<T> {
  readonly #storage: KeyedStorage<T>;

  protected constructor({key}: {key: string}) {
    this.#storage = new KeyedIdbStorage<T>({key});
  }

  get(): Promise<Option<T>> {
    return this.#storage.get();
  }

  async set(value: T): Promise<void> {
    await this.#storage.set(value);
  }

  async del(): Promise<void> {
    await this.#storage.del();
  }
}

export abstract class ServiceWithInvoices<T> extends Service<T> {
  readonly #invoicesStorage: KeyedStorage<DateString[]>;

  protected constructor(args: {key: string}) {
    super(args);

    this.#invoicesStorage = new KeyedIdbStorage<DateString[]>({key: 'invoices'});
  }

  getInvoices(): Promise<Option<DateString[]>> {
    return this.#invoicesStorage.get();
  }

  async setInvoices(invoices: DateString[]): Promise<void> {
    await this.#invoicesStorage.set(invoices);
  }
}

export abstract class ServiceWithActiveProjects<T> extends Service<T> {
  readonly #activeProjectsStorage: KeyedStorage<ProjectId[]>;

  protected constructor(args: {key: string}) {
    super(args);

    this.#activeProjectsStorage = new KeyedIdbStorage<ProjectId[]>({key: 'active-projects'});
  }

  getActiveProjects(): Promise<Option<ProjectId[]>> {
    return this.#activeProjectsStorage.get();
  }

  async setActiveProjects(activeProjects: ProjectId[]): Promise<void> {
    await this.#activeProjectsStorage.set(activeProjects);
  }
}
