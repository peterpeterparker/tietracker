export interface SummaryDay {
  day: Date | number;
  milliseconds: number;
  billable: number;
}

export interface SummaryTotalValues {
  milliseconds: number;
  billable: number;
}

export interface SummaryTotal {
  week: SummaryTotalValues;
  today: SummaryTotalValues;
}

export interface Summary {
  days: SummaryDay[];
  total: SummaryTotal;
}
