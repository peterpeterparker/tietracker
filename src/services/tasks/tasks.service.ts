import { get, set, del } from 'idb-keyval';

import uuid from 'uuid/v4';

import format from 'date-fns/format';

import { Project } from '../../models/project';
import { Task } from '../../models/task';

import { TaskInProgress, TaskInProgressData } from '../../store/interfaces/task.inprogress';

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

    start(project: Project): Promise<TaskInProgress> {
        return new Promise<TaskInProgress>(async (resolve, reject) => {
            try {
                const taskInProgress: TaskInProgress = await get('task-in-progress');

                if (taskInProgress) {
                    reject('Only one task at a time.');
                    return;
                }

                const task: TaskInProgress = await this.createTask(project);

                set('task-in-progress', task);

                resolve(task);
            } catch (err) {
                reject(err);
            }
        });
    }

    stop(): Promise<Task> {
        return new Promise<Task>(async (resolve, reject) => {
            try {
                let task: Task = await get('task-in-progress');

                if (!task || !task.data) {
                    reject('No task in progress found.');
                    return;
                }

                const now: number = new Date().getTime();

                task.data.updated_at = now;
                task.data.to = now;

                await this.saveTask(task);

                await this.addTaskToInvoices();

                del('task-in-progress');

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

    private createTask(project: Project): Promise<TaskInProgress> {
        return new Promise<TaskInProgress>((resolve, reject) => {
            if (!project || !project.data || !project.data.client) {
                reject('Project is empty.');
                return;
            }

            const now: number = new Date().getTime();

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
                        rate: project.data.rate
                    },
                    client: {
                        name: project.data.client.name,
                        color: project.data.client.color
                    },
                    invoice: {
                        status: 'open'
                    }
                }
            }

            resolve(task);
        });
    }

    private addTaskToInvoices(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const today: string = format(new Date(), 'yyyy-MM-dd');

            let invoices: string[] = await get('invoices');

            if (invoices && invoices.indexOf(today) > -1) {
                resolve();
                return;
            }

            if (!invoices || invoices.length <= 0) {
                invoices = [];
            }

            invoices.push(today);

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

                const today: string = format(new Date(), 'yyyy-MM-dd');

                let tasks: Task[] = await get(`tasks-${today}`);

                if (!tasks || tasks.length <= 0) {
                    tasks = [];
                }

                tasks.push(task);

                set(`tasks-${today}`, tasks);

                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    list(updateStateFunction: Function): Promise<void> {
        return new Promise<void>((resolve) => {
            this.tasksWorker.onmessage = ($event: MessageEvent) => {
                if ($event && $event.data) {
                    updateStateFunction($event.data);
                }
            };

            this.tasksWorker.postMessage('listTasks');

            resolve();
        });
    }

}