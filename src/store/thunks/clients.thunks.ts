import {RootThunkResult} from './types.thunks';

import {Client, ClientData} from '../../models/client';
import {CREATE_CLIENT, INIT_CLIENTS} from '../types/clients.types';

import {ClientsService} from '../../services/clients/clients.service';

export function createClient(data: ClientData): RootThunkResult<Promise<Client>> {
  return async (dispatch, getState) => {
    const client: Client = await ClientsService.getInstance().create(data);

    dispatch({type: CREATE_CLIENT, payload: client});

    return client;
  };
}

export function initClients(): RootThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    const clients: Client[] = await ClientsService.getInstance().list();

    dispatch({type: INIT_CLIENTS, payload: clients});
  };
}
