import {differenceInMilliseconds} from 'date-fns';
import {CLIENT_COLOR_FALLBACK} from '../../constants';
import {TaskItem} from '../../store/interfaces/task.item';
import {DateString} from '../../types/date';
import {Task} from '../../types/task';
import {isNullish, nonNullish} from '../../utils/utils.nullish';
import {KeyedIdbStorage} from '../storages/idb.storage';
import {loadClients, loadProjects} from './utils/utils';
import {WorkerClients, WorkerProjects} from './utils/utils.types';

export const listTasks = async ({day}: {day: DateString}) => {
  const projects = await loadProjects();

  if (isNullish(projects)) {
    return [];
  }

  const clients = await loadClients();

  if (isNullish(clients)) {
    return [];
  }

  const tasks = await listTasksForDay({projects, clients, day});

  tasks.sort((a, b) => {
    return new Date(b.data.from).getTime() - new Date(a.data.from).getTime();
  });

  return tasks;
};

const listTasksForDay = async ({
  projects,
  day,
  clients,
}: {
  projects: WorkerProjects;
  clients: WorkerClients;
  day: DateString;
}): Promise<TaskItem[]> => {
  const storage = new KeyedIdbStorage<Task[]>({key: `tasks-${day}`});
  const tasks = await storage.get();

  if (isNullish(tasks) || tasks.length <= 0) {
    return [];
  }

  const results: TaskItem[] = [];

  tasks
    .filter(
      (task) =>
        nonNullish(clients?.[task.data.client_id]) && nonNullish(projects?.[task.data.project_id]),
    )
    .forEach((task) => {
      const {color, ...client} = clients[task.data.client_id];

      const taskItem: unknown = {...task};
      (taskItem as TaskItem).data.client = {
        ...client,
        color: color ?? CLIENT_COLOR_FALLBACK,
      };
      (taskItem as TaskItem).data.project = projects[task.data.project_id];

      const milliseconds = differenceInMilliseconds(
        new Date(task.data.to ?? Date.now()),
        new Date(task.data.from),
      );

      (taskItem as TaskItem).data.milliseconds = milliseconds;

      const rate = projects[task.data.project_id].rate;

      const hours = milliseconds > 0 ? milliseconds / (1000 * 60 * 60) : 0;
      const billable = rate && rate.hourly > 0 ? hours * rate.hourly : 0;

      (taskItem as TaskItem).data.billable = billable;

      results.push(taskItem as TaskItem);
    });

  return results;
};
