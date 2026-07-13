import {eachDayOfInterval, endOfWeek, startOfWeek, subDays, subWeeks} from 'date-fns';
import {format as fnsFormat} from 'date-fns/format';
import {SummaryDay} from '../store/interfaces/summary';

export interface DayResult {
  label: string;
  milliseconds: number;
  billable: number;
}

export const buildPastDays = (): Date[] => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  return eachDayOfInterval({start: startOfMonth, end: subDays(today, 1)}).reverse();
};

export const mapDays = ({days, ranges}: {days: SummaryDay[]; ranges: Date[]}): DayResult[] => {
  return days.map((d, i) => ({
    label: fnsFormat(ranges[i], 'EEEE, MMM dd yyyy'),
    milliseconds: d.milliseconds,
    billable: d.billable,
  }));
};

export const mapWeeks = ({
  days,
  weekRanges,
}: {
  days: SummaryDay[];
  weekRanges: {weekStart: Date; weekEnd: Date}[];
}): DayResult[] => {
  return weekRanges.map(({weekStart, weekEnd}, wi) => {
    const slice = days.slice(wi * 7, wi * 7 + 7);

    return {
      label: `${fnsFormat(weekStart, 'MMM dd')} – ${fnsFormat(weekEnd, 'MMM dd yyyy')}`,
      milliseconds: slice.reduce((sum, d) => sum + d.milliseconds, 0),
      billable: slice.reduce((sum, d) => sum + d.billable, 0),
    };
  });
};

export const buildWeekRanges = (): {weekStart: Date; weekEnd: Date}[] => {
  const now = new Date();

  return Array.from({length: 12}, (_, i) => {
    const ref = subWeeks(now, i + 1);

    return {
      weekStart: startOfWeek(ref, {weekStartsOn: 1}),
      weekEnd: endOfWeek(ref, {weekStartsOn: 1}),
    };
  });
};

export const buildWeekDays = ({
  weekRanges,
}: {
  weekRanges: {weekStart: Date; weekEnd: Date}[];
}): Date[] => {
  return weekRanges.flatMap(({weekStart, weekEnd}) =>
    eachDayOfInterval({start: weekStart, end: weekEnd}),
  );
};
