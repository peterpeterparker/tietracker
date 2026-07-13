import {eachDayOfInterval, endOfWeek, startOfWeek} from 'date-fns';
import {Summary} from '../store/interfaces/summary';

export class SummaryService {
  private static instance: SummaryService;

  private summaryWorker = new Worker('./workers/summary.js');

  private constructor() {
    // Private constructor, singleton
  }

  static getInstance() {
    if (!SummaryService.instance) {
      SummaryService.instance = new SummaryService();
    }
    return SummaryService.instance;
  }

  async compute({
    updateFn,
    days,
  }: {
    updateFn: (data: Summary) => void;
    days?: Date[];
  }): Promise<void> {
    this.summaryWorker.onmessage = ($event: MessageEvent) => {
      if ($event && $event.data) {
        updateFn($event.data);
      }
    };

    this.summaryWorker.postMessage({msg: 'compute', days: days ?? this.#week()});
  }

  #week(): Date[] {
    const today = new Date();

    return eachDayOfInterval({
      start: startOfWeek(today, {weekStartsOn: 1}),
      end: endOfWeek(today, {weekStartsOn: 1}),
    });
  }
}
