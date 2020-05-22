importScripts('./libs/idb-keyval-iife.min.js');
importScripts('./libs/dayjs.min.js');

importScripts('./utils/utils.js');

self.onmessage = async ($event) => {
  if ($event && $event.data && $event.data.msg === 'listTasks') {
    await self.listTasks($event.data.day);
  }
};

self.listTasks = async (day) => {
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

  const tasks = await self.listTasksForDay(projects, clients, day);

  if (!tasks || tasks.length <= 0) {
    self.postMessage([]);
    return;
  }

  tasks.sort((a, b) => {
    return b.data.from - a.data.from;
  });

  self.postMessage(tasks);
};

function listTasksForDay(projects, clients, day) {
  return new Promise(async (resolve) => {
    const tasks = await idbKeyval.get(`tasks-${day}`);

    if (!tasks || tasks.length <= 0) {
      resolve([]);
      return;
    }

    const results = [];

    tasks.forEach((task) => {
      let taskItem = {...task};
      taskItem.data.client = clients !== undefined ? clients[task.data.client_id] : undefined;
      taskItem.data.project = projects !== undefined ? projects[task.data.project_id] : undefined;

      const milliseconds = dayjs(task.data.to).diff(new Date(task.data.from));

      taskItem.data.milliseconds = milliseconds;

      const rate = projects[task.data.project_id].rate;

      const hours = milliseconds > 0 ? milliseconds / (1000 * 60 * 60) : 0;
      const billable = rate && rate.hourly > 0 ? hours * rate.hourly : 0;

      taskItem.data.billable = billable;

      results.push(taskItem);
    });

    resolve(results);
  });
}
