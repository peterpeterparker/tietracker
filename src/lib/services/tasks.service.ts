import {
  addMinutes,
  isBefore,
  lightFormat,
  roundToNearestMinutes,
  setSeconds,
  subMinutes,
} from 'date-fns';
import {v4 as uuid} from 'uuid';
import {TaskInProgress, TaskInProgressData} from '../store/interfaces/task.inprogress';
import type {DateString} from '../types/date';
import type {Project} from '../types/project';
import type {Settings} from '../types/settings';
import type {Task, TaskData} from '../types/task';
import {isNullish, nonNullish} from '../utils/utils.nullish';
import {IdbStorage} from './_idb.storage';
import {ServiceWithInvoices} from './_service';

export class TasksService extends ServiceWithInvoices<TaskInProgress> {
  static #instance: TasksService;

  #tasksWorker = new Worker('./workers/tasks.js');

  private constructor() {
    super({key: 'task-in-progress'});
  }

  static getInstance() {
    if (isNullish(TasksService.#instance)) {
      TasksService.#instance = new TasksService();
    }
    return TasksService.#instance;
  }

  async start(project: Project, settings: Settings): Promise<TaskInProgress> {
    const taskInProgress = await this.get();

    if (nonNullish(taskInProgress)) {
      throw new Error('Only one task at a time.');
    }

    const task = await this.createTaskInProgress(project, settings);

    await this.set(task);

    return task;
  }

  async stop(roundTime: number): Promise<void> {
    const task = await this.get();

    if (isNullish(task)) {
      throw new Error('No task in progress found.');
    }

    await this.saveTaskAndInvoice(task, roundTime, true);

    await this.del();
  }

  async create(taskData: TaskData, roundTime: number): Promise<void> {
    const task: Task = {
      id: uuid(),
      data: taskData,
    };

    await this.saveTaskAndInvoice(task, roundTime, false);
  }

  private async saveTaskAndInvoice(task: Task, roundTime: number, endNow: boolean): Promise<void> {
    const now = new Date();

    task.data.updated_at = now.getTime();

    const from =
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

    const dayShort = lightFormat(task.data.from, 'yyyy-MM-dd') as DateString;
    await this.addTaskToInvoices(dayShort);
  }

  async updateTaskInProgress(task: TaskInProgress): Promise<TaskInProgress> {
    task.data.updated_at = new Date().getTime();

    await this.set(task);

    return task;
  }

  async current(): Promise<Option<TaskInProgress>> {
    return await this.get();
  }

  private async createTaskInProgress(
    project: Project,
    settings: Settings,
  ): Promise<TaskInProgress> {
    if (isNullish(project.data) || isNullish(project.data.client)) {
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

  private async addTaskToInvoices(day: DateString): Promise<void> {
    let invoices = await this.getInvoices();

    if (nonNullish(invoices) && invoices.indexOf(day) > -1) {
      return;
    }

    if (isNullish(invoices) || invoices.length <= 0) {
      invoices = [];
    }

    invoices.push(day);

    await this.setInvoices(invoices);
  }

  private async saveTask(task: Task): Promise<void> {
    const taskToPersist: Task = {...task};

    // Clean before save
    delete (taskToPersist.data as TaskInProgressData)['client'];
    delete (taskToPersist.data as TaskInProgressData)['project'];

    const storeDate = lightFormat(task.data.from, 'yyyy-MM-dd');

    const storage = new IdbStorage<Task[]>({key: `tasks-${storeDate}`});

    let tasks = await storage.get();

    if (isNullish(tasks) || tasks.length <= 0) {
      tasks = [];
    }

    tasks.push(task);

    await storage.set(tasks);
  }

  async list(updateStateFunction: Function, forDate: Date): Promise<void> {
    this.#tasksWorker.onmessage = ($event: MessageEvent) => {
      if (nonNullish($event?.data)) {
        updateStateFunction($event.data, forDate);
      }
    };

    this.#tasksWorker.postMessage({msg: 'listTasks', day: lightFormat(forDate, 'yyyy-MM-dd')});
  }

  /**
   * @param task
   * @param day The store index, like saved in indexDB tasks-2019-12-19
   */
  async update(task: Option<Task>, day: DateString): Promise<void> {
    if (isNullish(task?.data)) {
      throw new Error('Task is not defined.');
    }

    const taskToPersist: Task = {...task};

    // Clean before save
    delete (taskToPersist.data as TaskInProgressData)['client'];
    delete (taskToPersist.data as TaskInProgressData)['project'];

    const tasks = await this.load(day);

    const index = tasks.findIndex((filteredTask) => filteredTask.id === taskToPersist.id);

    if (index < 0) {
      throw new Error('Tasks not found.');
    }

    taskToPersist.data.updated_at = new Date().getTime();

    tasks[index] = taskToPersist;

    const storage = new IdbStorage<Task[]>({key: `tasks-${day}`});
    await storage.set(tasks);

    await this.addTaskToInvoices(day);
  }

  async delete(task: Task | undefined, day: DateString): Promise<void> {
    if (isNullish(task?.data)) {
      throw new Error('Task is not defined.');
    }

    const tasks = await this.load(day);

    const index = tasks.findIndex((filteredTask: Task) => filteredTask.id === task.id);

    if (index < 0) {
      throw new Error('Tasks not found.');
    }

    tasks.splice(index, 1);

    const storage = new IdbStorage<Task[]>({key: `tasks-${day}`});
    await storage.set(tasks);
  }

  private async load(day: DateString): Promise<Task[]> {
    const storage = new IdbStorage<Task[]>({key: `tasks-${day}`});
    const tasks = await storage.get();

    if (isNullish(tasks) || tasks.length <= 0) {
      throw new Error('No tasks found for the specific day.');
    }

    return tasks;
  }

  async find(id: Option<string>, day: string): Promise<Task | undefined> {
    if (isNullish(id)) {
      return undefined;
    }

    const storage = new IdbStorage<Task[]>({key: `tasks-${day}`});
    const tasks = await storage.get();

    if (isNullish(tasks) || tasks.length <= 0) {
      return undefined;
    }

    return tasks.find((filteredTask: Task) => filteredTask.id === id);
  }
}
