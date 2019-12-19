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
                name: value.data.name
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
            let taskInProgress = {...task};
            taskInProgress.data.client = clients !== undefined ? clients[task.data.client_id] : undefined;
            taskInProgress.data.project = projects !== undefined ? projects[task.data.project_id] : undefined;

            results.push(taskInProgress);
        });

        resolve(results);
    });
}