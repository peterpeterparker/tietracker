import { combineReducers } from 'redux';

import { clientsReducer } from './clients.reducer';

export const rootReducer = combineReducers({
    clients: clientsReducer
});

export type RootState = ReturnType<typeof rootReducer>