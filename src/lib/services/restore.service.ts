import {Settings} from '../types/settings';
import {emitError} from '../utils/utils.events';
import {isNullish} from '../utils/utils.nullish';
import {restore} from './workers/restore.worker';

export class RestoreService {
  static #instance: RestoreService;

  private constructor() {}

  static getInstance() {
    if (isNullish(RestoreService.#instance)) {
      RestoreService.#instance = new RestoreService();
    }
    return RestoreService.#instance;
  }

  async restore({
    zip,
    settings,
    done,
  }: {
    zip: Nullish<File>;
    done: (success: boolean) => Promise<void>;
    settings: Settings;
  }) {
    if (isNullish(zip)) {
      await done(false);
      return;
    }

    const result = await restore({zip, settings});

    if (result.status === 'error') {
      emitError(
        result.err instanceof Error
          ? result.err.message
          : 'Unexpected error while closing invoices',
      );
    }

    await done(result.status === 'success');
  }
}
