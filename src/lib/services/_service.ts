import {KeyedStorage} from './storages/storage';

export abstract class Service<T> {
  readonly #storage: KeyedStorage<T>;

  protected constructor({storage}: {storage: KeyedStorage<T>}) {
    this.#storage = storage;
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
