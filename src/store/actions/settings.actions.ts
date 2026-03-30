import {Settings} from '../../models/settings';
import {INIT_SETTINGS, SettingsActionTypes, UPDATE_SETTINGS} from '../types/settings.types';

export function initSettings(settings: Settings): SettingsActionTypes {
  return {
    type: INIT_SETTINGS,
    payload: settings,
  };
}

export function updateSettings(settings: Settings): SettingsActionTypes {
  return {
    type: UPDATE_SETTINGS,
    payload: settings,
  };
}
