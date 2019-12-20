import { ClientActionTypes, CREATE_CLIENT, INIT_CLIENTS } from '../types/clients.types';
import { Client } from '../../models/client';

export interface ClientsState {
    clients: Client[];
}

const initialState: ClientsState = {
    clients: []
}

export function clientsReducer(state = initialState, action: ClientActionTypes): ClientsState {
    switch (action.type) {
        case CREATE_CLIENT:
            return {
                clients: [...state.clients, action.payload]
            };
        case INIT_CLIENTS:
            return {
                clients: action.payload ? action.payload : []
            };
        default:
            return state;
    }
}
