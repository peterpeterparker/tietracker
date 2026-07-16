import {DateString} from '../types/date';
import {ProjectId} from '../types/project';
import {Service} from './_service';
import {KeyedFilesystemStorage} from './storages/filesystem.storage';
import {KeyedStorage} from './storages/storage';

export abstract class StorageService<T> extends Service<T> {
  protected constructor({key}: {key: string}) {
    super({storage: new KeyedFilesystemStorage<T>({key})});
  }
}

export abstract class StorageServiceWithInvoices<T> extends StorageService<T> {
  readonly #invoicesStorage: KeyedStorage<DateString[]>;

  protected constructor(args: {key: string}) {
    super(args);

    this.#invoicesStorage = new KeyedFilesystemStorage<DateString[]>({key: 'invoices'});
  }

  getInvoices(): Promise<Option<DateString[]>> {
    return this.#invoicesStorage.get();
  }

  async setInvoices(invoices: DateString[]): Promise<void> {
    await this.#invoicesStorage.set(invoices);
  }
}

export abstract class StorageServiceWithActiveProjects<T> extends StorageService<T> {
  readonly #activeProjectsStorage: KeyedStorage<ProjectId[]>;

  protected constructor(args: {key: string}) {
    super(args);

    this.#activeProjectsStorage = new KeyedFilesystemStorage<ProjectId[]>({key: 'active-projects'});
  }

  getActiveProjects(): Promise<Option<ProjectId[]>> {
    return this.#activeProjectsStorage.get();
  }

  async setActiveProjects(activeProjects: ProjectId[]): Promise<void> {
    await this.#activeProjectsStorage.set(activeProjects);
  }
}
