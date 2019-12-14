import { Client } from '../../models/client';

export const ADD_CLIENT = 'ADD_CLIENT';

interface AddClientAction {
    type: typeof ADD_CLIENT
    payload: Client
}

export type ClientActionTypes = AddClientAction;
