import {Directory} from '@capacitor/filesystem';
import {KEYS} from '../constants';
import {DateString} from '../types/date';
import {ProjectId} from '../types/project';
import {Settings} from '../types/settings';
import {nonNullish} from '../utils/utils.nullish';
import {Service} from './_service';
import {KeyedFilesystemStorage} from './storages/filesystem.storage';
import {KeyedStorage} from './storages/storage';

export abstract class StorageService<T> extends Service<T> {
  protected constructor({key, iOS}: {key: string} & Pick<Settings, 'iOS'>) {
    super({
      storage: new KeyedFilesystemStorage<T>({
        key,
        ...StorageService.directory({iOS}),
      }),
    });
  }

  protected static directory({iOS}: Pick<Settings, 'iOS'>): {directory?: Directory} {
    return {
      ...(nonNullish(iOS) && {
        directory: iOS.iCloudSync ? Directory.Library : Directory.LibraryNoCloud,
      }),
    };
  }
}

export abstract class StorageServiceWithInvoices<T> extends StorageService<T> {
  readonly #invoicesStorage: KeyedStorage<DateString[]>;

  protected constructor({key, iOS}: {key: string} & Pick<Settings, 'iOS'>) {
    super({key, iOS});

    this.#invoicesStorage = new KeyedFilesystemStorage<DateString[]>({
      key: KEYS.filesystem.invoices,
      ...StorageService.directory({iOS}),
    });
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

  protected constructor({key, iOS}: {key: string} & Pick<Settings, 'iOS'>) {
    super({key, iOS});

    this.#activeProjectsStorage = new KeyedFilesystemStorage<ProjectId[]>({
      key: 'active-projects',
      ...StorageService.directory({iOS}),
    });
  }

  getActiveProjects(): Promise<Option<ProjectId[]>> {
    return this.#activeProjectsStorage.get();
  }

  async setActiveProjects(activeProjects: ProjectId[]): Promise<void> {
    await this.#activeProjectsStorage.set(activeProjects);
  }
}
