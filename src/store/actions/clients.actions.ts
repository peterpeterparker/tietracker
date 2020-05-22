import {ClientActionTypes, CREATE_CLIENT, INIT_CLIENTS} from '../types/clients.types';
import {Client} from '../../models/client';

export function addClient(newClient: Client): ClientActionTypes {
  return {
    type: CREATE_CLIENT,
    payload: newClient,
  };
}

export function initClients(clients: Client[]): ClientActionTypes {
  return {
    type: INIT_CLIENTS,
    payload: clients,
  };
}
