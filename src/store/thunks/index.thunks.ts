import {connect, ConnectedProps} from 'react-redux';

import {Action} from 'redux';
import {ThunkDispatch} from 'redux-thunk';

import {RootState} from '../reducers';

import {createClient, initClients} from './clients.thunks';
import {createProject, initActiveProjects, updateActiveProject} from './projects.thunks';
import {createTask, initTask, listTasks, startTask, stopTask, updateTask} from './tasks.thunks';

import {Client, ClientData} from '../../models/client';
import {Project, ProjectData} from '../../models/project';
import {Settings} from '../../models/settings';

import {TaskData} from '../../models/task';
import {TaskInProgress} from '../interfaces/task.inprogress';
import {listProjectsInvoices} from './invoices.thunks';
import {initSettings, updateSettings} from './settings.thunks';
import {computeSummary} from './summary.thunks';
import {initTheme, switchTheme} from './theme.thunks';

export type RootThunkDispatch = ThunkDispatch<RootState, undefined, Action>;

const mapState = (state: RootState) => ({
  clients: state.clients.clients,
  activeProjects: state.activeProjects.projects,
  taskInProgress: state.tasks.taskInProgress,
  taskItems: state.tasks.taskItems,
  taskItemsSelectedDate: state.tasks.taskItemsSelectedDate,
  summary: state.summary.summary,
  invoices: state.invoices.invoices,
  settings: state.settings.settings,
  dark: state.theme.dark,
});

const mapDispatch = (dispatch: RootThunkDispatch) => ({
  createClient: (data: ClientData) => dispatch(createClient(data)),
  initClients: () => dispatch(initClients()),

  createProject: (client: Client, data: ProjectData) => dispatch(createProject(client, data)),
  initActiveProjects: () => dispatch(initActiveProjects()),
  updateActiveProject: (project: Project) => dispatch(updateActiveProject(project)),

  startTask: (project: Project, settings: Settings) => dispatch(startTask(project, settings)),
  updateTask: (task: TaskInProgress) => dispatch(updateTask(task)),
  stopTask: (delayDispatch: number = 0, roundTime: number) =>
    dispatch(stopTask(delayDispatch, roundTime)),
  initTask: () => dispatch(initTask()),
  createTask: (taskData: TaskData, roundTime: number) => dispatch(createTask(taskData, roundTime)),

  computeSummary: () => dispatch(computeSummary()),

  listTasks: (forDate: Date) => dispatch(listTasks(forDate)),

  listProjectsInvoices: () => dispatch(listProjectsInvoices()),

  initSettings: () => dispatch(initSettings()),
  updateSettings: (settings: Settings) => dispatch(updateSettings(settings)),

  initTheme: () => dispatch(initTheme()),
  switchTheme: () => dispatch(switchTheme()),
});

export const rootConnector = connect(mapState, mapDispatch);

export type RootProps = ConnectedProps<typeof rootConnector>;
