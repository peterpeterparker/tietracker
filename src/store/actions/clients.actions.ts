import { ClientActionTypes, ADD_CLIENT } from '../types/types';
import { Client } from '../../models/client';
import { RootState } from '../reducers';
import { Action } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { saveClient } from '../../services/clients/clients.service';

export function addClient(newClient: Client): ClientActionTypes {
    return {
        type: ADD_CLIENT,
        payload: newClient
    }
}

export type ClientThunkDispatch = ThunkDispatch<RootState, undefined, Action>;

type ClientThunkResult<R> = ThunkAction<R, RootState, undefined, Action>;

export function persistClient(newClient: Client): ClientThunkResult<Promise<void>> {
    return async (dispatch, getState) => {
        saveClient(newClient);

        dispatch({ type: 'ADD_CLIENT', payload: newClient });
    };
}