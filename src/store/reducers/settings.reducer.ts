import {Settings} from '../../models/settings';

import {INIT_SETTINGS, SettingsActionTypes} from '../types/settings.types';
import {SettingsService} from '../../services/settings/settings.service';

export interface SettingsState {
    settings: Settings;
}

const initialState: SettingsState = {
    settings: SettingsService.getInstance().getDefaultSettings()
};

export function settingsReducer(state = initialState, action: SettingsActionTypes): SettingsState {
    switch (action.type) {
        case INIT_SETTINGS:
            return {
                settings: action.payload
            };
        default:
            return state;
    }
}
