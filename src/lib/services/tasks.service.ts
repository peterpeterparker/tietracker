import {
  addMinutes,
  isBefore,
  lightFormat,
  roundToNearestMinutes,
  setSeconds,
  subMinutes,
} from 'date-fns';
import {del, get, set} from 'idb-keyval';
import {v4 as uuid} from 'uuid';
import {TaskInProgress, TaskInProgressData} from '../store/interfaces/task.inprogress';
import type {Project} from '../types/project';
import type {Settings} from '../types/settings';
import type {Task, TaskData} from '../types/task';

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

  async start(project: Project, settings: Settings): Promise<TaskInProgress> {
    const taskInProgress = await get<TaskInProgress>('task-in-progress');

    if (taskInProgress) {
      throw new Error('Only one task at a time.');
    }

    const task = await this.createTaskInProgress(project, settings);

    await set('task-in-progress', task);

    return task;
  }

  async stop(roundTime: number): Promise<Task> {
    const task = await get<Task>('task-in-progress');

    if (!task || !task.data) {
      throw new Error('No task in progress found.');
    }

    await this.saveTaskAndInvoice(task, roundTime, true);

    await del('task-in-progress');

    return task;
  }

  async create(taskData: TaskData, roundTime: number): Promise<Task> {
    if (!taskData) {
      throw new Error('No task data provided.');
    }

    const task: Task = {
      id: uuid(),
      data: taskData,
    };

    await this.saveTaskAndInvoice(task, roundTime, false);

    return task;
  }

  private async saveTaskAndInvoice(task: Task, roundTime: number, endNow: boolean): Promise<Task> {
    if (!task || !task.data) {
      throw new Error('No task provided.');
    }

    const now = new Date();

    task.data.updated_at = now.getTime();

    const from: Date =
      roundTime > 0
        ? roundToNearestMinutes(task.data.from, {nearestTo: roundTime as 1 | 5 | 15 | 30})
        : setSeconds(new Date(task.data.from), 0);
    task.data.from = from.getTime();

    const toCompare = endNow ? now : new Date(task.data.to as number | Date);
    const to = isBefore(subMinutes(toCompare, roundTime), from)
      ? addMinutes(from, roundTime)
      : toCompare;

    task.data.to =
      roundTime > 0
        ? roundToNearestMinutes(to, {nearestTo: roundTime as 1 | 5 | 15 | 30}).getTime()
        : setSeconds(to.getTime(), 0);

    await this.saveTask(task);

    const dayShort = lightFormat(task.data.from, 'yyyy-MM-dd');
    await this.addTaskToInvoices(dayShort);

    return task;
  }

  async updateTaskInProgress(task: TaskInProgress): Promise<TaskInProgress | undefined> {
    if (!task || !task.data) {
      throw new Error('Task is not defined.');
    }

    task.data.updated_at = new Date().getTime();

    await set('task-in-progress', task);

    return task;
  }

  async current(): Promise<TaskInProgress | undefined> {
    return await get<TaskInProgress>('task-in-progress');
  }

  private async createTaskInProgress(
    project: Project,
    settings: Settings,
  ): Promise<TaskInProgress> {
    if (!project || !project.data || !project.data.client) {
      throw new Error('Project is empty.');
    }

    const now = new Date().getTime();

    // We create a TaskInProgress as, furthermore than being persisted, it gonna be added to the root state too
    const task: TaskInProgress = {
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

    return task;
  }

  private async addTaskToInvoices(day: string): Promise<void> {
    let invoices = await get<string[]>('invoices');

    if (invoices && invoices.indexOf(day) > -1) {
      return;
    }

    if (!invoices || invoices.length <= 0) {
      invoices = [];
    }

    invoices.push(day);

    await set('invoices', invoices);
  }

  private async saveTask(task: Task): Promise<void> {
    if (!task || !task.data) {
      throw new Error('Task is not defined.');
    }

    const taskToPersist: Task = {...task};

    // Clean before save
    delete (taskToPersist.data as TaskInProgressData)['client'];
    delete (taskToPersist.data as TaskInProgressData)['project'];

    const storeDate = lightFormat(task.data.from, 'yyyy-MM-dd');

    let tasks = await get<Task[]>(`tasks-${storeDate}`);

    if (!tasks || tasks.length <= 0) {
      tasks = [];
    }

    tasks.push(task);

    await set(`tasks-${storeDate}`, tasks);
  }

  async list(updateStateFunction: Function, forDate: Date): Promise<void> {
    this.tasksWorker.onmessage = ($event: MessageEvent) => {
      if ($event && $event.data) {
        updateStateFunction($event.data, forDate);
      }
    };

    this.tasksWorker.postMessage({msg: 'listTasks', day: lightFormat(forDate, 'yyyy-MM-dd')});
  }

  /**
   * @param task
   * @param day The store index, like saved in indexDB tasks-2019-12-19
   */
  async update(task: Task | undefined, day: string): Promise<void> {
    if (!task || !task.data || !day) {
      throw new Error('Task is not defined.');
    }

    const taskToPersist: Task = {...task};

    // Clean before save
    delete (taskToPersist.data as TaskInProgressData)['client'];
    delete (taskToPersist.data as TaskInProgressData)['project'];

    const tasks: Task[] = await this.load(day);

    const index = tasks.findIndex((filteredTask: Task) => {
      return filteredTask.id === taskToPersist.id;
    });

    if (index < 0) {
      throw new Error('Tasks not found.');
    }

    taskToPersist.data.updated_at = new Date().getTime();

    tasks[index] = taskToPersist;

    await set(`tasks-${day}`, tasks);

    await this.addTaskToInvoices(day);
  }

  async delete(task: Task | undefined, day: string): Promise<void> {
    if (!task || !task.data || !day) {
      throw new Error('Task is not defined.');
    }

    const tasks = await this.load(day);

    const index = tasks.findIndex((filteredTask: Task) => {
      return filteredTask.id === task.id;
    });

    if (index < 0) {
      throw new Error('Tasks not found.');
    }

    tasks.splice(index, 1);

    await set(`tasks-${day}`, tasks);
  }

  private async load(day: string): Promise<Task[]> {
    const tasks = await get<Task[]>(`tasks-${day}`);

    if (!tasks || tasks.length <= 0) {
      throw new Error('No tasks found for the specific day.');
    }

    return tasks;
  }

  async find(id: string, day: string): Promise<Task | undefined> {
    if (!id || id === undefined || !day || day === undefined) {
      return undefined;
    }

    const tasks = await get<Task[]>(`tasks-${day}`);

    if (!tasks || tasks.length <= 0) {
      return undefined;
    }

    return tasks.find((filteredTask: Task) => {
      return filteredTask.id === id;
    });
  }
}
