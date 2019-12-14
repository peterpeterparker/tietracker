import { ClientActionTypes, ADD_CLIENT } from '../types/types';
import { Client } from '../../models/client';

export function addClient(newClient: Client): ClientActionTypes {
    return {
        type: ADD_CLIENT,
        payload: newClient
    }
}
