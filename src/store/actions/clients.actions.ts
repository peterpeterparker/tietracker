import { ClientActionTypes, ADD_CLIENT, INIT_CLIENTS } from '../types/types';
import { Client } from '../../models/client';

export function addClient(newClient: Client): ClientActionTypes {
    return {
        type: ADD_CLIENT,
        payload: newClient
    }
}

export function initClients(clients: Client[]): ClientActionTypes {
    return {
        type: INIT_CLIENTS,
        payload: clients
    }
}
