import { connect, ConnectedProps } from 'react-redux';

import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { RootState } from '../reducers';

import { createClient, initClients } from './clients.thunks';
import { createProject, initActiveProjects } from './projects.thunks';

import { ClientData } from '../../models/client';
import { ProjectData } from '../../models/project';

export type RootThunkDispatch = ThunkDispatch<RootState, undefined, Action>;

const mapState = (state: RootState) => ({
    clients: state.clients.clients,
    activeProjects: state.activeProjects.projects
});

const mapDispatch = (dispatch: RootThunkDispatch) => ({
    createClient: (data: ClientData) => dispatch(createClient(data)),
    initClients: () => dispatch(initClients()),
    createProject: (clientId: string, data: ProjectData) => dispatch(createProject(clientId, data)),
    initActiveProjects: () => dispatch(initActiveProjects())
});

export const rootConnector = connect(
    mapState,
    mapDispatch
);

export type RootProps = ConnectedProps<typeof rootConnector>;
