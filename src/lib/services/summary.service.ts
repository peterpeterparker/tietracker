import {eachDayOfInterval, endOfWeek, startOfWeek} from 'date-fns';
import {Summary} from '../store/interfaces/summary';
import {isNullish, nonNullish} from '../utils/utils.nullish';

export class SummaryService {
  static #instance: SummaryService;

  #summaryWorker = new Worker('./workers/summary.js');

  private constructor() {}

  static getInstance() {
    if (isNullish(SummaryService.#instance)) {
      SummaryService.#instance = new SummaryService();
    }
    return SummaryService.#instance;
  }

  async compute({
    updateFn,
    days,
  }: {
    updateFn: (data: Summary) => void;
    days?: Date[];
  }): Promise<void> {
    this.#summaryWorker.onmessage = ($event: MessageEvent) => {
      if (nonNullish($event?.data)) {
        updateFn($event.data);
      }
    };

    this.#summaryWorker.postMessage({msg: 'compute', days: days ?? this.#week()});
  }

  #week(): Date[] {
    const today = new Date();

    return eachDayOfInterval({
      start: startOfWeek(today, {weekStartsOn: 1}),
      end: endOfWeek(today, {weekStartsOn: 1}),
    });
  }
}
