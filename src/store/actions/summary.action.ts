import {SummaryActionTypes, COMPUTE_SUMMARY} from '../types/summary.types';

import {Summary} from '../interfaces/summary';

export function computeSummary(summary: Summary): SummaryActionTypes {
  return {
    type: COMPUTE_SUMMARY,
    payload: summary,
  };
}
