export interface Settings {
    currency: string;
    roundTime: number;
    vat?: number;

    descriptions?: string[];

    created_at: Date | number;
    updated_at: Date | number;
}
