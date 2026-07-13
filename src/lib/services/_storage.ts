export abstract class Storage<T> {
  protected key: string;

  constructor({key}: {key: string}) {
    this.key = key;
  }

  abstract get(): Promise<Option<T>>;
  abstract set(value: T): Promise<void>;
}
