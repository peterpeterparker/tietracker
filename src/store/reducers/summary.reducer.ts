import {Summary} from '../interfaces/summary';
import {COMPUTE_SUMMARY, SummaryActionTypes} from '../types/summary.types';

export interface SummaryState {
  summary: Summary | undefined;
}

const initialState: SummaryState = {
  summary: undefined,
};

export function summaryReducer(state = initialState, action: SummaryActionTypes): SummaryState {
  switch (action.type) {
    case COMPUTE_SUMMARY:
      return {
        summary: {...action.payload},
      };
    default:
      return state;
  }
}
