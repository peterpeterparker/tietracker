import {IdbStorage} from '../../services/_idb.storage';
import {Client} from '../../types/client';
import {Project, ProjectData, ProjectId} from '../../types/project';
import {isNullish, nonNullish} from '../../utils/utils.nullish';
import {WorkerClients, WorkerProjects} from './utils.types';

export const loadClients = async (): Promise<Option<WorkerClients>> => {
  const storage = new IdbStorage<Client[]>({key: 'clients'});
  const values = await storage.get();

  if (isNullish(values) || values.length <= 0) {
    return undefined;
  }

  const result: WorkerClients = {};
  values.forEach((value) => {
    if (nonNullish(value.id)) {
      result[value.id] = {
        name: value.data.name,
        color: value.data.color,
      };
    }
  });

  return result;
};

export const loadProjects = async (): Promise<Option<WorkerProjects>> => {
  const storage = new IdbStorage<Project[]>({key: 'projects'});
  const values = await storage.get();

  if (isNullish(values) || values.length <= 0) {
    return undefined;
  }

  const result: Record<ProjectId, Pick<ProjectData, 'name' | 'rate' | 'budget'>> = {};

  values.forEach((value) => {
    result[value.id] = {
      name: value.data.name,
      rate: value.data.rate ? value.data.rate : {hourly: 0, vat: false},
      budget: value.data.budget ? value.data.budget : undefined,
    };
  });

  return result;
};
