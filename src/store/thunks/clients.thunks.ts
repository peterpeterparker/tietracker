import { Action } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../reducers';
import { Client } from '../../models/client';
import { ADD_CLIENT, INIT_CLIENTS } from '../types/types';

import { saveClient, loadClients } from '../../services/clients/clients.service';

type ClientThunkDispatch = ThunkDispatch<RootState, undefined, Action>;

type ClientThunkResult<R> = ThunkAction<R, RootState, undefined, Action>;

export function persistClient(newClient: Client): ClientThunkResult<Promise<void>> {
    return async (dispatch, getState) => {
        saveClient(newClient);

        dispatch({ type: ADD_CLIENT, payload: newClient });
    };
}

export function initClients(): ClientThunkResult<Promise<void>> {
    return async (dispatch, getState) => {
        const clients: Client[] = await loadClients();

        dispatch({ type: INIT_CLIENTS, payload: clients });
    };
}

const mapState = (state: RootState) => ({
    clients: state.clients.clients
});

const mapDispatch = (dispatch: ClientThunkDispatch) => ({
    persistClient: (newClient: Client) => dispatch(persistClient(newClient)),
    initClients: () => dispatch(initClients())
});

export const clientConnector = connect(
    mapState,
    mapDispatch
);

// The inferred type will look like:
// {clients: Client[], addClient: (newClient: Client) => void etc.}
export type ClientsProps = ConnectedProps<typeof clientConnector>;