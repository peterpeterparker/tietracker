import {INIT_THEME, SWITCH_THEME, ThemeActionTypes} from '../types/theme.types';

export function switchTheme(dark: boolean): ThemeActionTypes {
  return {
    type: SWITCH_THEME,
    payload: dark,
  };
}

export function initTheme(dark: boolean): ThemeActionTypes {
  return {
    type: INIT_THEME,
    payload: dark,
  };
}
