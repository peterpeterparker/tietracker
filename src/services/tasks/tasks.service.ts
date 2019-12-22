import {get, set, del} from 'idb-keyval';

import uuid from 'uuid/v4';

import {endOfMinute, startOfMinute, lightFormat} from 'date-fns';

import {Project} from '../../models/project';
import {Task} from '../../models/task';

import {TaskInProgress, TaskInProgressData} from '../../store/interfaces/task.inprogress';

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

                const task: TaskInProgress = await this.createTaskInProgress(project);

                await set('task-in-progress', task);

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

                const now: Date = new Date();

                task.data.updated_at = now.getTime();

                task.data.from = startOfMinute(task.data.from);
                task.data.to = endOfMinute(now);

                await this.saveTask(task);

                const dayShort: string = lightFormat(now, 'yyyy-MM-dd');
                await this.addTaskToInvoices(dayShort);

                await del('task-in-progress');

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

    private createTaskInProgress(project: Project): Promise<TaskInProgress> {
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
            };

            resolve(task);
        });
    }

    private addTaskToInvoices(day: string): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
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

                const today: string = lightFormat(new Date(), 'yyyy-MM-dd');

                let tasks: Task[] = await get(`tasks-${today}`);

                if (!tasks || tasks.length <= 0) {
                    tasks = [];
                }

                tasks.push(task);

                await set(`tasks-${today}`, tasks);

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

}
