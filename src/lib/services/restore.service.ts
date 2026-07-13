import {emitError} from '../utils/utils.events';
import {isNullish} from '../utils/utils.nullish';

export class RestoreService {
  static #instance: RestoreService;

  #restoreWorker = new Worker('./workers/restore.js');

  private constructor() {}

  static getInstance() {
    if (isNullish(RestoreService.#instance)) {
      RestoreService.#instance = new RestoreService();
    }
    return RestoreService.#instance;
  }

  async restore({zip, done}: {zip: Nullish<File>; done: (success: boolean) => Promise<void>}) {
    if (isNullish(zip)) {
      await done(false);
      return;
    }

    this.#restoreWorker.onmessage = async ($event: MessageEvent) => {
      if ($event.data?.result === 'error') {
        emitError($event.data.msg);
      }

      await done($event.data?.result === 'success');
    };

    await this.postMessage(zip);
  }

  private async postMessage(zip: Blob) {
    this.#restoreWorker.postMessage({
      msg: `restore-idb`,
      zip,
    });
  }
}
