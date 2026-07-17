import {SummaryService} from '../../services/summary.service';
import {Summary} from '../interfaces/summary';
import {WithSettings} from '../types/store.types';
import {COMPUTE_SUMMARY} from '../types/summary.types';
import {RootThunkResult} from './types.thunks';

export function computeSummary({settings}: WithSettings): RootThunkResult<Promise<void>> {
  return async (dispatch, _getState) => {
    const updateFn = (data: Summary) => {
      dispatch({type: COMPUTE_SUMMARY, payload: data});
    };

    await SummaryService.getInstance().compute({updateFn, settings});
  };
}
