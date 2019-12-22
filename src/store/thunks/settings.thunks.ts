import {RootThunkResult} from './types.thunks';

import {Settings} from '../../models/settings';
import {SettingsService} from '../../services/settings/settings.service';

import {INIT_SETTINGS} from '../types/settings.types';

export function initSettings(): RootThunkResult<Promise<void>> {
    return async (dispatch, getState) => {
        const settings: Settings = await SettingsService.getInstance().init();

        dispatch({ type: INIT_SETTINGS, payload: settings });
    };
}
