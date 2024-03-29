import {Settings} from '../../models/settings';

import {SettingsService} from '../../services/settings/settings.service';
import {INIT_SETTINGS, SettingsActionTypes, UPDATE_SETTINGS} from '../types/settings.types';

export interface SettingsState {
  settings: Settings;
}

const initialState: SettingsState = {
  settings: SettingsService.getInstance().getDefaultSettings(),
};

export function settingsReducer(state = initialState, action: SettingsActionTypes): SettingsState {
  switch (action.type) {
    case INIT_SETTINGS:
    case UPDATE_SETTINGS:
      return {
        settings: {...action.payload},
      };
    default:
      return state;
  }
}
