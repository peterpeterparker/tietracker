import {get, set} from 'idb-keyval';

export class ThemeService {

    private static instance: ThemeService;

    private constructor() {
        // Private constructor, singleton
    }

    static getInstance() {
        if (!ThemeService.instance) {
            ThemeService.instance = new ThemeService();
        }
        return ThemeService.instance;
    }

    async switch(dark: boolean) {
        const body: HTMLElement | null = document.querySelector('body');

        if (body) {
            dark ?
                body.classList.add('dark') :
                body.classList.remove('dark');
        }

        try {
            await set('dark_mode', dark);
        } catch (err) {
            // We ignore this error. In worst case scenario, the application will be displayed in another theme after next refresh.
        }
    }

    async initDarkModePreference(): Promise<void> {
        try {
            const savedDarkModePreference: boolean = await get('dark_mode');

            // If user already specified once a preference, we use that as default
            if (savedDarkModePreference !== undefined) {
                this.switch(savedDarkModePreference);
                return;
            }
        } catch (err) {
            this.switch(false);
            return;
        }

        // Otherwise we check the prefers-color-scheme of the OS
        const darkModePreferenceFromMedia: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

        this.switch(darkModePreferenceFromMedia.matches);
    }
}
