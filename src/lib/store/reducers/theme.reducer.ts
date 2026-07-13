import {INIT_THEME, SWITCH_THEME, ThemeActionTypes} from '../types/theme.types';

export interface ThemeState {
  dark: boolean | undefined;
}

const initialState: ThemeState = {
  dark: undefined,
};

export function themeReducer(state = initialState, action: ThemeActionTypes): ThemeState {
  switch (action.type) {
    case INIT_THEME:
    case SWITCH_THEME:
      return {
        dark: action.payload,
      };
    default:
      return state;
  }
}
