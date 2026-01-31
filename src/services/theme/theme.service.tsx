import {get, set} from 'idb-keyval';

export class ThemeService {
  private static instance: ThemeService;

  private darkTheme: boolean | undefined = undefined;

  private constructor() {
    // Private constructor, singleton
  }

  static getInstance() {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  isDark(): boolean | undefined {
    return this.darkTheme;
  }

  private async switch(dark: boolean | undefined) {
    this.darkTheme = dark;

    const body: HTMLElement | null = document.querySelector('body');

    if (body) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      dark ? body.classList.add('dark') : body.classList.remove('dark');
    }

    const {head} = document;
    head?.children?.namedItem('theme-color')?.setAttribute('content', dark ? '#230f29' : '#fff');

    try {
      await set('dark_mode', dark);
    } catch (err) {
      // We ignore this error. In worst case scenario, the application will be displayed in another theme after next refresh.
    }
  }

  async switchTheme(): Promise<boolean | undefined> {
    await this.switch(!this.darkTheme);

    return this.darkTheme;
  }

  async initDarkModePreference(): Promise<boolean> {
    try {
      const savedDarkModePreference: boolean | undefined = await get('dark_mode');

      // If user already specified once a preference, we use that as default
      if (savedDarkModePreference !== undefined) {
        await this.switch(savedDarkModePreference);
        return savedDarkModePreference;
      }
    } catch (err) {
      await this.switch(false);
      return false;
    }

    // Otherwise we check the prefers-color-scheme of the OS
    const darkModePreferenceFromMedia: MediaQueryList = window.matchMedia(
      '(prefers-color-scheme: dark)',
    );

    this.switch(darkModePreferenceFromMedia.matches);
    return darkModePreferenceFromMedia.matches;
  }
}
