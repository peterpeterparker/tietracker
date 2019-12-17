export interface ClientData {
    name: string;
    color?: string;

    create_at?: Date | number;
    updated_at?: Date | number;
}

export interface Client {
    id?: string;
    data: ClientData;
}
