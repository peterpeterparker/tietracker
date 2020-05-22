import {Client} from '../../models/client';

export const CREATE_CLIENT = 'CREATE_CLIENT';
export const INIT_CLIENTS = 'INIT_CLIENTS';

interface CreateClientAction {
  type: typeof CREATE_CLIENT;
  payload: Client;
}

interface InitClientsAction {
  type: typeof INIT_CLIENTS;
  payload: Client[];
}

export type ClientActionTypes = CreateClientAction | InitClientsAction;
