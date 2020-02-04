import {Currency} from '../definitions/currency';

export interface Settings {
    currency: Currency;
    roundTime: number;
    vat?: number;

    descriptions?: string[];

    notifications?: boolean;

    created_at: Date | number;
    updated_at: Date | number;
}
