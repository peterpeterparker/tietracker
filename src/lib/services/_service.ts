import {DateString} from '../types/date';
import {ProjectId} from '../types/project';
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

  async del(): Promise<void> {
    await this.#storage.del();
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

  async setInvoices(invoices: DateString[]): Promise<void> {
    await this.#invoicesStorage.set(invoices);
  }
}

export abstract class ServiceWithActiveProjects<T> extends Service<T> {
  readonly #activeProjectsStorage: Storage<ProjectId[]>;

  protected constructor(args: {key: string}) {
    super(args);

    this.#activeProjectsStorage = new IdbStorage<ProjectId[]>({key: 'active-projects'});
  }

  getActiveProjects(): Promise<Option<ProjectId[]>> {
    return this.#activeProjectsStorage.get();
  }

  async setActiveProjects(activeProjects: ProjectId[]): Promise<void> {
    await this.#activeProjectsStorage.set(activeProjects);
  }
}
