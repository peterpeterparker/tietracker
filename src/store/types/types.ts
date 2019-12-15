import { Client } from '../../models/client';

export const ADD_CLIENT = 'ADD_CLIENT';
export const INIT_CLIENTS = 'INIT_CLIENTS';

interface AddClientAction {
    type: typeof ADD_CLIENT
    payload: Client
}

interface InitClientsAction {
    type: typeof INIT_CLIENTS
    payload: Client[]
}

export type ClientActionTypes = AddClientAction | InitClientsAction;
