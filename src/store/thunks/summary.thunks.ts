import {RootThunkResult} from './types.thunks';

import {COMPUTE_SUMMARY} from '../types/summary.types';

import {SummaryService} from '../../services/summary/summary.service';

import {Summary} from '../interfaces/summary';

export function computeSummary(): RootThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    await SummaryService.getInstance().compute((data: Summary) => {
      dispatch({type: COMPUTE_SUMMARY, payload: data});
    });
  };
}
