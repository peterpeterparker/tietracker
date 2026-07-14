import type {ClientData, ClientId} from '../../../types/client';
import type {ProjectData, ProjectId} from '../../../types/project';

export type WorkerClient = Pick<ClientData, 'name' | 'color'>;
export type WorkerProject = Pick<ProjectData, 'name' | 'rate' | 'budget'>;

export type WorkerClients = Record<ClientId, WorkerClient>;
export type WorkerProjects = Record<ProjectId, WorkerProject>;
