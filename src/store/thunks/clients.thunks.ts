import {Client, ClientData} from '../../models/client';
import {ClientsService} from '../../services/clients.service';
import {CREATE_CLIENT, INIT_CLIENTS} from '../types/clients.types';
import {RootThunkResult} from './types.thunks';

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
