export interface Settings {
    currency: string;
    roundTime: number;
    vat?: number;

    created_at: Date | number;
    updated_at: Date | number;
}
