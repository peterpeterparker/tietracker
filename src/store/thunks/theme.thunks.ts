import {RootThunkResult} from './types.thunks';

import {ThemeService} from '../../services/theme/theme.service';

import {INIT_THEME, SWITCH_THEME} from '../types/theme.types';

export function switchTheme(): RootThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    const dark: boolean | undefined = await ThemeService.getInstance().switchTheme();

    dispatch({type: SWITCH_THEME, payload: dark});
  };
}

export function initTheme(): RootThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    const dark: boolean = await ThemeService.getInstance().initDarkModePreference();

    dispatch({type: INIT_THEME, payload: dark});
  };
}
