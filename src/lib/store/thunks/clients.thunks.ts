import {ClientsService} from '../../services/clients.service';
import {Client, ClientData} from '../../types/client';
import {CREATE_CLIENT, INIT_CLIENTS} from '../types/clients.types';
import type {WithSettings} from '../types/store.types';
import {RootThunkResult} from './types.thunks';

export function createClient({
  data,
  settings,
}: {data: ClientData} & WithSettings): RootThunkResult<Promise<Client>> {
  return async (dispatch, getState) => {
    const client = await ClientsService.create(settings).create(data);

    dispatch({type: CREATE_CLIENT, payload: client});

    return client;
  };
}

export function initClients({settings}: WithSettings): RootThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    const clients: Client[] = await ClientsService.create(settings).list();

    dispatch({type: INIT_CLIENTS, payload: clients});
  };
}
