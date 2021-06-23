export class RestoreService {
  private static instance: RestoreService;

  private restoreWorker: Worker = new Worker('./workers/restore.js');

  private constructor() {
    // Private constructor, singleton
  }

  static getInstance() {
    if (!RestoreService.instance) {
      RestoreService.instance = new RestoreService();
    }
    return RestoreService.instance;
  }

  async restore(zip: File | undefined | null) {
    if (!zip) {
      return;
    }

    this.restoreWorker.onmessage = async ($event: MessageEvent) => {
      console.log('Alright', $event);
    };

    await this.postMessage(zip);
  }

  private async postMessage(zip: Blob) {
    this.restoreWorker.postMessage({
      msg: `restore-idb`,
      zip,
    });
  }
}
