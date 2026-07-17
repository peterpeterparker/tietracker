import {SettingsService} from '../../services/settings.service';
import {Settings} from '../../types/settings';
import {INIT_SETTINGS, UPDATE_SETTINGS} from '../types/settings.types';
import {RootThunkResult} from './types.thunks';

export function initSettings(): RootThunkResult<Promise<Settings>> {
  return async (dispatch, getState) => {
    const settings = await SettingsService.getInstance().init();

    dispatch({type: INIT_SETTINGS, payload: settings});

    return settings;
  };
}

export function updateSettings(data: Settings): RootThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    const settings: Settings = await SettingsService.getInstance().update(data);

    dispatch({type: UPDATE_SETTINGS, payload: settings});
  };
}
