import {eachDayOfInterval, endOfWeek, startOfWeek} from 'date-fns';
import {Summary} from '../store/interfaces/summary';
import {isNullish} from '../utils/utils.nullish';
import {computeSummary} from './workers/summary.worker';

export class SummaryService {
  static #instance: SummaryService;

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
    const summary = await computeSummary({
      days: days ?? this.#week(),
    });

    updateFn(summary);
  }

  #week(): Date[] {
    const today = new Date();

    return eachDayOfInterval({
      start: startOfWeek(today, {weekStartsOn: 1}),
      end: endOfWeek(today, {weekStartsOn: 1}),
    });
  }
}
