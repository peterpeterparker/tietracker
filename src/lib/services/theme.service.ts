import {KEYS} from '../constants';
import {isNullish, nonNullish} from '../utils/utils.nullish';
import {PreferencesService} from './_preferences.service';

type DarkTheme = Option<boolean>;

export class ThemeService extends PreferencesService<DarkTheme> {
  static #instance: ThemeService;

  #darkTheme: DarkTheme = undefined;

  private constructor() {
    super({key: KEYS.preferences.theme});
  }

  static getInstance() {
    if (isNullish(ThemeService.#instance)) {
      ThemeService.#instance = new ThemeService();
    }
    return ThemeService.#instance;
  }

  isDark(): Option<boolean> {
    return this.#darkTheme;
  }

  private async switch(dark: Option<boolean>) {
    this.#darkTheme = dark;

    const body = document.querySelector('body');

    if (nonNullish(body)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      dark ? body.classList.add('dark') : body.classList.remove('dark');
    }

    const {head} = document;
    head?.children?.namedItem('theme-color')?.setAttribute('content', dark ? '#230f29' : '#fff');

    try {
      await this.set(dark);
    } catch (err) {
      // We ignore this error. In worst case scenario, the application will be displayed in another theme after next refresh.
    }
  }

  async switchTheme(): Promise<boolean | undefined> {
    await this.switch(!this.#darkTheme);

    return this.#darkTheme;
  }

  async initDarkModePreference(): Promise<boolean> {
    try {
      const savedDarkModePreference = await this.get();

      // If user already specified once a preference, we use that as default
      if (nonNullish(savedDarkModePreference)) {
        await this.switch(savedDarkModePreference);
        return savedDarkModePreference;
      }
    } catch (_err: unknown) {
      await this.switch(false);
      return false;
    }

    // Otherwise we check the prefers-color-scheme of the OS
    const darkModePreferenceFromMedia: MediaQueryList = window.matchMedia(
      '(prefers-color-scheme: dark)',
    );

    await this.switch(darkModePreferenceFromMedia.matches);
    return darkModePreferenceFromMedia.matches;
  }
}
