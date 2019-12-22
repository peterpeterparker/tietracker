import { connect, ConnectedProps } from 'react-redux';

import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { RootState } from '../reducers';

import { createClient, initClients } from './clients.thunks';
import { createProject, initActiveProjects } from './projects.thunks';
import {startTask, stopTask, initTask, listTasks, updateTask} from './tasks.thunks';

import { ClientData, Client } from '../../models/client';
import { ProjectData, Project } from '../../models/project';
import {Settings} from '../../models/settings';

import { computeSummary } from './summary.thunks';
import { listProjectsInvoices } from './invoices.thunks';
import {initSettings, updateSettings} from './settings.thunks';
import {TaskInProgress} from '../interfaces/task.inprogress';

export type RootThunkDispatch = ThunkDispatch<RootState, undefined, Action>;

const mapState = (state: RootState) => ({
    clients: state.clients.clients,
    activeProjects: state.activeProjects.projects,
    taskInProgress: state.tasks.taskInProgress,
    summary: state.summary.summary,
    invoices: state.invoices.invoices,
    settings: state.settings.settings
});

const mapDispatch = (dispatch: RootThunkDispatch) => ({
    createClient: (data: ClientData) => dispatch(createClient(data)),
    initClients: () => dispatch(initClients()),

    createProject: (client: Client, data: ProjectData) => dispatch(createProject(client, data)),
    initActiveProjects: () => dispatch(initActiveProjects()),

    startTask: (project: Project) => dispatch(startTask(project)),
    updateTask: (task: TaskInProgress) =>  dispatch(updateTask(task)),
    stopTask: (delayDispatch: number = 0, roundTime: number) => dispatch(stopTask(delayDispatch, roundTime)),
    initTask: () => dispatch(initTask()),

    computeSummary: () => dispatch(computeSummary()),

    listTasks: () => dispatch(listTasks()),

    listProjectsInvoices: () => dispatch(listProjectsInvoices()),

    initSettings: () => dispatch(initSettings()),
    updateSettings: (settings: Settings) => dispatch(updateSettings(settings))
});

export const rootConnector = connect(
    mapState,
    mapDispatch
);

export type RootProps = ConnectedProps<typeof rootConnector>;
