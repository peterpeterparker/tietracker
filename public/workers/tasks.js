importScripts('./libs/idb-keyval-iife.min.js');
importScripts('./libs/dayjs.min.js');

self.onmessage = async ($event) => {
    if ($event && $event.data === 'listTasks') {
        self.listTasks();
    }
};

self.listTasks = async () => {
    const projects = await loadProjects();

    if (!projects || projects === undefined) {
        self.postMessage([]);

        return;
    }

    const clients = await loadClients();

    if (!clients || clients === undefined) {
        self.postMessage([]);

        return;
    }

    const tasks = await listTodayTasks(projects, clients);

    if (!tasks || tasks.length <= 0) {
        self.postMessage([]);
        return;
    }

    tasks.sort((a, b) => { return b.data.updated_at - a.data.updated_at });

    self.postMessage(tasks);
};

function loadClients() {
    return new Promise(async (resolve) => {
        const values = await idbKeyval.get('clients');

        if (!values || values.length <= 0) {
            resolve(undefined);
            return;
        }

        let result = {};
        values.forEach((value) => {
            result[value.id] = {
                name: value.data.name,
                color: value.data.color
            };
        });

        resolve(result);
    });
}

function loadProjects() {
    return new Promise(async (resolve) => {
        const values = await idbKeyval.get('projects');

        if (!values || values.length <= 0) {
            resolve(undefined);
            return;
        }

        let result = {};
        values.forEach((value) => {
            result[value.id] = {
                name: value.data.name,
                rate: value.data.rate ? value.data.rate : { hourly: 0, vat: false }
            };
        });

        resolve(result);
    });
}

function listTodayTasks(projects, clients) {
    return new Promise(async (resolve) => {
        const tasks = await idbKeyval.get(`tasks-${new Date().toISOString().substring(0, 10)}`);

        if (!tasks || tasks.length <= 0) {
            resolve([]);
            return;
        }

        const results = [];

        tasks.forEach((task) => {
            let taskItem = { ...task };
            taskItem.data.client = clients !== undefined ? clients[task.data.client_id] : undefined;
            taskItem.data.project = projects !== undefined ? projects[task.data.project_id] : undefined;

            const milliseconds = dayjs(task.data.to).diff(new Date(task.data.from));
            const hours = milliseconds > 0 ? milliseconds / (1000 * 60 * 60) : 0;

            taskItem.data.hours = hours;

            const rate = projects[task.data.project_id].rate;

            const billable = rate && rate.hourly > 0 ? hours * rate.hourly : 0;
            taskItem.data.billable = billable;

            results.push(taskItem);
        });

        resolve(results);
    });
}
