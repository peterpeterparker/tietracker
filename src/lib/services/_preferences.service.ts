import {Service} from './_service';
import {KeyedPreferencesStorage} from './storages/preferences.storage';

export abstract class PreferencesService<T> extends Service<T> {
  protected constructor({key}: {key: string}) {
    super({storage: new KeyedPreferencesStorage<T>({key})});
  }
}
