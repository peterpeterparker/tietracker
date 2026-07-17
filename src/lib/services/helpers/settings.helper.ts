import {Directory} from '@capacitor/filesystem';
import {Settings} from '../../types/settings';
import {nonNullish} from '../../utils/utils.nullish';

export const directory = ({iOS}: Pick<Settings, 'iOS'>): {directory?: Directory} => {
  return {
    ...(nonNullish(iOS) && {
      directory: iOS.iCloudSync ? Directory.Library : Directory.LibraryNoCloud,
    }),
  };
};
