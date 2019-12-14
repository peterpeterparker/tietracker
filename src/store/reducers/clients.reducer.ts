import { ClientActionTypes } from '../types/types';
import { Client } from '../../models/client';

export interface ClientsState {
    clients: Client[];
}

const initialState: ClientsState = {
    clients: []
  }

export function clientsReducer(state = initialState, action: ClientActionTypes): ClientsState {
    switch (action.type) {
        case 'ADD_CLIENT':
            return {
                clients: [...state.clients, action.payload]
            };
        default:
            return state;
    }
}
