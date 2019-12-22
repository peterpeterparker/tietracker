import {get, set} from 'idb-keyval';

import {Settings} from '../../models/settings';

export class SettingsService {

    private static instance: SettingsService;

    private constructor() {
        // Private constructor, singleton
    }

    static getInstance() {
        if (!SettingsService.instance) {
            SettingsService.instance = new SettingsService();
        }
        return SettingsService.instance;
    }

    init(): Promise<Settings> {
        return new Promise<Settings>(async (resolve) => {
            try {
                let settings: Settings = await get('settings');

                if (!settings) {
                    settings = this.getDefaultSettings();

                    await set('settings', settings);
                }

                resolve(settings);
            } catch (err) {
                resolve(this.getDefaultSettings());
            }
        });
    }

    getDefaultSettings(): Settings {
        const now: Date = new Date();
        return {
            currency: 'CHF',
            created_at: now.getTime(),
            updated_at: now.getTime()
        }
    }
}
