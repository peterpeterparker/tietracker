export interface SettingsNotifications {
    count: number;
    every: 'minute';
}

export interface Settings {
    currency: string;
    roundTime: number;
    vat?: number;

    descriptions?: string[];

    notifications?: SettingsNotifications;

    created_at: Date | number;
    updated_at: Date | number;
}
