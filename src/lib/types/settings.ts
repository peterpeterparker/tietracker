import {Currency} from './currency';

export interface iOSSettings {
  // Directory.Library or Directory.LibraryNoCloud
  // @see https://capacitorjs.com/docs/apis/filesystem#directory
  iCloudSync: boolean;
}

export interface Settings {
  currency: Currency;
  roundTime: number;
  vat?: number;

  signature?: string;

  descriptions?: string[];

  notifications?: boolean;
  backup?: boolean;

  iOS?: iOSSettings;

  created_at: Date | number;
  updated_at: Date | number;
}
