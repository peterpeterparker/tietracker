import {INIT_SETTINGS, SettingsActionTypes} from '../types/settings.types';

import {Settings} from '../../models/settings';

export function initClients(settings: Settings): SettingsActionTypes {
    return {
        type: INIT_SETTINGS,
        payload: settings
    }
}
