import {SummaryService} from '../../services/summary/summary.service';
import {Summary} from '../interfaces/summary';
import {COMPUTE_SUMMARY} from '../types/summary.types';
import {RootThunkResult} from './types.thunks';

export function computeSummary(): RootThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    const updateFn = (data: Summary) => {
      dispatch({type: COMPUTE_SUMMARY, payload: data});
    };

    await SummaryService.getInstance().compute({updateFn});
  };
}
