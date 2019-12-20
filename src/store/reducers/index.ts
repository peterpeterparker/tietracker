import { combineReducers } from 'redux';

import { clientsReducer } from './clients.reducer';
import { projectsReducer } from './projects.reducer';
import { tasksReducer } from './tasks.reducer';
import { summaryReducer } from './summary.reducer';
import { invoicesReducer } from './invoices.reducer';

export const rootReducer = combineReducers({
    clients: clientsReducer,
    activeProjects: projectsReducer,
    tasks: tasksReducer,
    summary: summaryReducer,
    invoices: invoicesReducer
});

export type RootState = ReturnType<typeof rootReducer>;
