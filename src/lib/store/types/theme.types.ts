export const SWITCH_THEME = 'SWITCH_THEME';
export const INIT_THEME = 'INIT_THEME';

export interface ThemeActionTypes {
  type: typeof SWITCH_THEME | typeof INIT_THEME;
  payload: boolean;
}
