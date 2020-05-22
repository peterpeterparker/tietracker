import {eachDayOfInterval, endOfWeek, startOfWeek} from 'date-fns';

export class SummaryService {
  private static instance: SummaryService;

  private summaryWorker: Worker = new Worker('./workers/summary.js');

  private constructor() {
    // Private constructor, singleton
  }

  static getInstance() {
    if (!SummaryService.instance) {
      SummaryService.instance = new SummaryService();
    }
    return SummaryService.instance;
  }

  compute(updateStateFunction: Function): Promise<void> {
    return new Promise<void>((resolve) => {
      this.summaryWorker.onmessage = ($event: MessageEvent) => {
        if ($event && $event.data) {
          updateStateFunction($event.data);
        }
      };

      this.summaryWorker.postMessage({msg: 'compute', days: this.week()});

      resolve();
    });
  }

  private week(): Date[] {
    const today: Date = new Date();

    return eachDayOfInterval({
      start: startOfWeek(today, {weekStartsOn: 1}),
      end: endOfWeek(today, {weekStartsOn: 1}),
    });
  }
}
