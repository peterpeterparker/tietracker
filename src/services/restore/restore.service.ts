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

  async restore({zip, done}: {zip: File | undefined | null; done: (success: boolean) => Promise<void>}) {
    if (!zip) {
      await done(false);
      return;
    }

    this.restoreWorker.onmessage = async ($event: MessageEvent) => {
      if ($event.data?.result === 'error') {
        // TODO show err
        console.error($event.data.msg);
      }

      await done($event.data?.result === 'success');
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
