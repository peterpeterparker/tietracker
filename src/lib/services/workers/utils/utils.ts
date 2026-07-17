import {KEYS} from '../../../constants';
import {Client} from '../../../types/client';
import {Project, ProjectData, ProjectId} from '../../../types/project';
import {Settings} from '../../../types/settings';
import {isNullish, nonNullish} from '../../../utils/utils.nullish';
import {directory} from '../../helpers/settings.helper';
import {KeyedFilesystemStorage} from '../../storages/filesystem.storage';
import {WorkerClients, WorkerProjects} from './utils.types';

export const loadClients = async ({
  settings,
}: {
  settings: Pick<Settings, 'iOS'>;
}): Promise<Option<WorkerClients>> => {
  const storage = new KeyedFilesystemStorage<Client[]>({
    key: KEYS.filesystem.clients,
    ...directory(settings),
  });
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

export const loadProjects = async ({
  settings,
}: {
  settings: Pick<Settings, 'iOS'>;
}): Promise<Option<WorkerProjects>> => {
  const storage = new KeyedFilesystemStorage<Project[]>({
    key: KEYS.filesystem.projects,
    ...directory(settings),
  });
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
