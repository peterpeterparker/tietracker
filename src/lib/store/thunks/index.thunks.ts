import {connect, ConnectedProps} from 'react-redux';
import {Action} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {Client, ClientData} from '../../types/client';
import {Project, ProjectData} from '../../types/project';
import {Settings} from '../../types/settings';
import {TaskData} from '../../types/task';
import {TaskInProgress} from '../interfaces/task.inprogress';
import {RootState} from '../reducers';
import type {WithSettings} from '../types/store.types';
import {createClient, initClients} from './clients.thunks';
import {listProjectsInvoices} from './invoices.thunks';
import {createProject, initActiveProjects, updateActiveProject} from './projects.thunks';
import {initSettings, updateSettings} from './settings.thunks';
import {computeSummary} from './summary.thunks';
import {createTask, initTask, listTasks, startTask, stopTask, updateTask} from './tasks.thunks';
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
  createClient: (args: {data: ClientData} & WithSettings) => dispatch(createClient(args)),
  initClients: (args: WithSettings) => dispatch(initClients(args)),

  createProject: (args: {client: Client; data: ProjectData} & WithSettings) =>
    dispatch(createProject(args)),
  initActiveProjects: (args: WithSettings) => dispatch(initActiveProjects(args)),
  updateActiveProject: (args: {project: Project} & WithSettings) =>
    dispatch(updateActiveProject(args)),

  startTask: (args: {project: Project} & WithSettings) => dispatch(startTask(args)),
  updateTask: (args: {task: TaskInProgress} & WithSettings) => dispatch(updateTask(args)),
  stopTask: (args: {delayDispatch?: number; roundTime: number} & WithSettings) =>
    dispatch(stopTask(args)),
  initTask: (args: WithSettings) => dispatch(initTask(args)),
  createTask: (args: {taskData: TaskData; roundTime: number} & WithSettings) =>
    dispatch(createTask(args)),

  computeSummary: () => dispatch(computeSummary()),

  listTasks: (args: {forDate: Date} & WithSettings) => dispatch(listTasks(args)),

  listProjectsInvoices: (args: WithSettings) => dispatch(listProjectsInvoices(args)),

  initSettings: () => dispatch(initSettings()),
  updateSettings: (settings: Settings) => dispatch(updateSettings(settings)),

  initTheme: () => dispatch(initTheme()),
  switchTheme: () => dispatch(switchTheme()),
});

export const rootConnector = connect(mapState, mapDispatch);

export type RootProps = ConnectedProps<typeof rootConnector>;
