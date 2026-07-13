import {Summary} from '../interfaces/summary';

export const COMPUTE_SUMMARY = 'COMPUTE_SUMMARY';

interface SummaryAction {
  type: typeof COMPUTE_SUMMARY;
  payload: Summary;
}

export type SummaryActionTypes = SummaryAction;
