import {Settings} from '../../models/settings';

export const INIT_SETTINGS = 'INIT_SETTINGS';

interface SettingsAction {
    type: typeof INIT_SETTINGS
    payload: Settings
}

export type SettingsActionTypes = SettingsAction
