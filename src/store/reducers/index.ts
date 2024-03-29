import {combineReducers} from 'redux';

import {clientsReducer} from './clients.reducer';
import {invoicesReducer} from './invoices.reducer';
import {projectsReducer} from './projects.reducer';
import {settingsReducer} from './settings.reducer';
import {summaryReducer} from './summary.reducer';
import {tasksReducer} from './tasks.reducer';
import {themeReducer} from './theme.reducer';

export const rootReducer = combineReducers({
  clients: clientsReducer,
  activeProjects: projectsReducer,
  tasks: tasksReducer,
  summary: summaryReducer,
  invoices: invoicesReducer,
  settings: settingsReducer,
  theme: themeReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
