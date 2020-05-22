import {get, set, del} from 'idb-keyval';

import {v4 as uuid} from 'uuid';

import {addMinutes, isBefore, lightFormat, roundToNearestMinutes, subMinutes} from 'date-fns';

import {Project} from '../../models/project';
import {Task, TaskData} from '../../models/task';

import {TaskInProgress, TaskInProgressData} from '../../store/interfaces/task.inprogress';
import {Settings} from '../../models/settings';

export class TasksService {
  private static instance: TasksService;

  private tasksWorker: Worker = new Worker('./workers/tasks.js');

  private constructor() {
    // Private constructor, singleton
  }

  static getInstance() {
    if (!TasksService.instance) {
      TasksService.instance = new TasksService();
    }
    return TasksService.instance;
  }

  start(project: Project, settings: Settings): Promise<TaskInProgress> {
    return new Promise<TaskInProgress>(async (resolve, reject) => {
      try {
        const taskInProgress: TaskInProgress = await get('task-in-progress');

        if (taskInProgress) {
          reject('Only one task at a time.');
          return;
        }

        const task: TaskInProgress = await this.createTaskInProgress(project, settings);

        await set('task-in-progress', task);

        resolve(task);
      } catch (err) {
        reject(err);
      }
    });
  }

  stop(roundTime: number): Promise<Task> {
    return new Promise<Task>(async (resolve, reject) => {
      try {
        let task: Task = await get('task-in-progress');

        if (!task || !task.data) {
          reject('No task in progress found.');
          return;
        }

        await this.saveTaskAndInvoice(task, roundTime, true);

        await del('task-in-progress');

        resolve(task);
      } catch (err) {
        reject(err);
      }
    });
  }

  create(taskData: TaskData, roundTime: number): Promise<Task> {
    return new Promise<Task>(async (resolve, reject) => {
      try {
        if (!taskData) {
          reject('No task data provided.');
          return;
        }

        const task: Task = {
          id: uuid(),
          data: taskData,
        };

        await this.saveTaskAndInvoice(task, roundTime, false);

        resolve(task);
      } catch (err) {
        reject(err);
      }
    });
  }

  private saveTaskAndInvoice(task: Task, roundTime: number, endNow: boolean): Promise<Task> {
    return new Promise<Task>(async (resolve, reject) => {
      try {
        if (!task || !task.data) {
          reject('No task provided.');
          return;
        }

        const now: Date = new Date();

        task.data.updated_at = now.getTime();

        const from: Date = roundTime > 0 ? roundToNearestMinutes(task.data.from, {nearestTo: roundTime}) : new Date(task.data.from);
        task.data.from = from.getTime();

        const toCompare: Date = endNow ? now : new Date(task.data.to as number | Date);
        const to: Date = isBefore(subMinutes(toCompare, roundTime), from) ? addMinutes(from, roundTime) : toCompare;

        task.data.to = roundTime > 0 ? roundToNearestMinutes(to, {nearestTo: roundTime}).getTime() : to.getTime();

        await this.saveTask(task);

        const dayShort: string = lightFormat(task.data.from, 'yyyy-MM-dd');
        await this.addTaskToInvoices(dayShort);

        resolve(task);
      } catch (err) {
        reject(err);
      }
    });
  }

  updateTaskInProgress(task: TaskInProgress): Promise<TaskInProgress | undefined> {
    return new Promise<TaskInProgress | undefined>(async (resolve, reject) => {
      try {
        if (!task || !task.data) {
          reject('Task is not defined.');
          return;
        }

        task.data.updated_at = new Date().getTime();

        await set('task-in-progress', task);

        resolve(task);
      } catch (err) {
        reject(err);
      }
    });
  }

  current(): Promise<TaskInProgress | undefined> {
    return new Promise<TaskInProgress | undefined>(async (resolve, reject) => {
      try {
        const task: TaskInProgress = await get('task-in-progress');

        resolve(task);
      } catch (err) {
        reject(err);
      }
    });
  }

  private createTaskInProgress(project: Project, settings: Settings): Promise<TaskInProgress> {
    return new Promise<TaskInProgress>((resolve, reject) => {
      if (!project || !project.data || !project.data.client) {
        reject('Project is empty.');
        return;
      }

      const now: number = new Date().getTime();

      // We create a TaskInProgress as, furthermore than being persisted, it gonna be added to the root state too
      let task: TaskInProgress = {
        id: uuid(),
        data: {
          from: now,
          client_id: project.data.client.id,
          project_id: project.id,
          created_at: now,
          updated_at: now,
          project: {
            name: project.data.name,
            rate: project.data.rate,
          },
          client: {
            name: project.data.client.name,
            color: project.data.client.color,
          },
          invoice: {
            status: 'open',
          },
        },
      };

      // Per default, if defined, we use the first description from the settings
      if (settings && settings.descriptions && settings.descriptions.length > 0) {
        task.data.description = settings.descriptions[0];
      }

      resolve(task);
    });
  }

  private addTaskToInvoices(day: string): Promise<void> {
    return new Promise<void>(async (resolve) => {
      let invoices: string[] = await get('invoices');

      if (invoices && invoices.indexOf(day) > -1) {
        resolve();
        return;
      }

      if (!invoices || invoices.length <= 0) {
        invoices = [];
      }

      invoices.push(day);

      await set('invoices', invoices);

      resolve();
    });
  }

  private saveTask(task: Task): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (!task || !task.data) {
          reject('Task is not defined.');
          return;
        }

        const taskToPersist: Task = {...task};

        // Clean before save
        delete (taskToPersist.data as TaskInProgressData)['client'];
        delete (taskToPersist.data as TaskInProgressData)['project'];

        const storeDate: string = lightFormat(task.data.from, 'yyyy-MM-dd');

        let tasks: Task[] = await get(`tasks-${storeDate}`);

        if (!tasks || tasks.length <= 0) {
          tasks = [];
        }

        tasks.push(task);

        await set(`tasks-${storeDate}`, tasks);

        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  list(updateStateFunction: Function, forDate: Date): Promise<void> {
    return new Promise<void>((resolve) => {
      this.tasksWorker.onmessage = ($event: MessageEvent) => {
        if ($event && $event.data) {
          updateStateFunction($event.data, forDate);
        }
      };

      this.tasksWorker.postMessage({msg: 'listTasks', day: lightFormat(forDate, 'yyyy-MM-dd')});

      resolve();
    });
  }

  /**
   * @param task
   * @param day The store index, like saved in indexDB tasks-2019-12-19
   */
  update(task: Task | undefined, day: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (!task || !task.data || !day) {
          reject('Task is not defined.');
          return;
        }

        const taskToPersist: Task = {...task};

        // Clean before save
        delete (taskToPersist.data as TaskInProgressData)['client'];
        delete (taskToPersist.data as TaskInProgressData)['project'];

        const tasks: Task[] = await this.load(day);

        const index: number = tasks.findIndex((filteredTask: Task) => {
          return filteredTask.id === taskToPersist.id;
        });

        if (index < 0) {
          reject('Tasks not found.');
          return;
        }

        taskToPersist.data.updated_at = new Date().getTime();

        tasks[index] = taskToPersist;

        await set(`tasks-${day}`, tasks);

        await this.addTaskToInvoices(day);

        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  delete(task: Task | undefined, day: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (!task || !task.data || !day) {
          reject('Task is not defined.');
          return;
        }

        const tasks: Task[] = await this.load(day);

        const index: number = tasks.findIndex((filteredTask: Task) => {
          return filteredTask.id === task.id;
        });

        if (index < 0) {
          reject('Tasks not found.');
          return;
        }

        tasks.splice(index, 1);

        await set(`tasks-${day}`, tasks);

        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  private load(day: string): Promise<Task[]> {
    return new Promise<Task[]>(async (resolve, reject) => {
      let tasks: Task[] = await get(`tasks-${day}`);

      if (!tasks || tasks.length <= 0) {
        reject('No tasks found for the specific day.');
        return;
      }

      resolve(tasks);
    });
  }

  find(id: string, day: string): Promise<Task | undefined> {
    return new Promise<Task>(async (resolve) => {
      if (!id || id === undefined || !day || day === undefined) {
        resolve(undefined);
        return;
      }

      const tasks: Task[] = await get(`tasks-${day}`);

      if (!tasks || tasks.length <= 0) {
        resolve(undefined);
        return;
      }

      const task: Task | undefined = tasks.find((filteredTask: Task) => {
        return filteredTask.id === id;
      });

      resolve(task);
    });
  }
}
