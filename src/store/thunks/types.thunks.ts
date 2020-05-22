import {Action} from 'redux';
import {ThunkAction} from 'redux-thunk';

import {RootState} from '../reducers';

export type RootThunkResult<R> = ThunkAction<R, RootState, undefined, Action>;
