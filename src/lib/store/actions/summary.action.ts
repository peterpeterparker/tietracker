import {Summary} from '../interfaces/summary';
import {COMPUTE_SUMMARY, SummaryActionTypes} from '../types/summary.types';

export function computeSummary(summary: Summary): SummaryActionTypes {
  return {
    type: COMPUTE_SUMMARY,
    payload: summary,
  };
}
