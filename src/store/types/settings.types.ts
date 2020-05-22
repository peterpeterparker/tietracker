import {Settings} from '../../models/settings';

export const INIT_SETTINGS = 'INIT_SETTINGS';
export const UPDATE_SETTINGS = 'UPDATE_SETTINGS';

interface SettingsAction {
  type: typeof INIT_SETTINGS | typeof UPDATE_SETTINGS;
  payload: Settings;
}

export type SettingsActionTypes = SettingsAction;
