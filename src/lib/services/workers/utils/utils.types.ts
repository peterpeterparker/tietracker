import type {ClientData, ClientId} from '../../../types/client';
import type {ProjectData, ProjectId} from '../../../types/project';

export type WorkerClients = Record<ClientId, Pick<ClientData, 'name' | 'color'>>;
export type WorkerProjects = Record<ProjectId, Pick<ProjectData, 'name' | 'rate' | 'budget'>>;
