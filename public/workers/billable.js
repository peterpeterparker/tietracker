importScripts('./libs/idb-keyval-iife.min.js');
importScripts('./libs/dayjs.min.js');

importScripts('./utils/utils.js');

self.onmessage = async ($event) => {
  if ($event && $event.data && $event.data.msg === 'listProjectsInvoices') {
    await self.listProjectsInvoices();
  } else if ($event && $event.data && $event.data.msg === 'listProjectInvoice') {
    await self.listProjectInvoice($event.data.invoices, $event.data.projectId);
  }
};

self.listProjectsInvoices = async () => {
  const invoices = await idbKeyval.get('invoices');

  await self.listInvoices(invoices, null);
};

self.listProjectInvoice = async (invoices, projectId) => {
  await self.listInvoices(invoices, projectId);
};

self.listInvoices = async (invoices, filterProjectId) => {
  if (!invoices || invoices.length <= 0) {
    self.postMessage([]);
    return;
  }

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

  const projectsWithInvoices = await listBillableProjects(invoices, projects, clients, filterProjectId);

  const results = reduceAllProjects(projectsWithInvoices);

  self.postMessage(results);
};

async function listBillableProjects(invoices, projects, clients, filterProjectId) {
  const promises = [];

  invoices.forEach((invoice) => {
    promises.push(buildProject(invoice, projects, clients, filterProjectId));
  });

  const results = await Promise.all(promises);

  return results;
}

function buildProject(invoice, projects, clients, filterProjectId) {
  return new Promise(async (resolve) => {
    const tasks = await idbKeyval.get(`tasks-${invoice}`);

    if (!tasks || tasks.length <= 0) {
      resolve(undefined);
      return;
    }

    // Only the tasks which are still not billed
    let filteredTasks = tasks.filter((task) => {
      return task.data.invoice.status === 'open';
    });

    if (!filteredTasks || filteredTasks.length <= 0) {
      resolve(undefined);
      return;
    }

    if (filterProjectId) {
      filteredTasks = filteredTasks.filter((task) => {
        return task.data.project_id === filterProjectId;
      });

      if (!filteredTasks || filteredTasks.length <= 0) {
        resolve(undefined);
        return;
      }
    }

    const results = {};

    filteredTasks.forEach((task) => {
      const milliseconds = dayjs(task.data.to).diff(new Date(task.data.from));
      const hours = milliseconds > 0 ? milliseconds / (1000 * 60 * 60) : 0;

      const rate = projects[task.data.project_id].rate;

      const billable = rate && rate.hourly > 0 ? hours * rate.hourly : 0;

      let project;
      if (results[task.data.project_id] !== undefined) {
        project = results[task.data.project_id];
        project.hours += hours;
        project.billable += billable;
      } else {
        project = {
          client_id: task.data.client_id,
          project_id: task.data.project_id,
          client: clients !== undefined ? clients[task.data.client_id] : undefined,
          project: projects !== undefined ? projects[task.data.project_id] : undefined,
          hours: hours,
          billable: billable,
        };

        results[task.data.project_id] = project;
      }
    });

    resolve(results);
  });
}

function reduceAllProjects(projectsWithInvoices) {
  if (!projectsWithInvoices || projectsWithInvoices.length <= 0) {
    return [];
  }

  const projects = {};

  // Iterate on all days containing x projects
  projectsWithInvoices.forEach((projectsPerDays) => {
    // Sum up, reduce projects to one key per project
    if (projectsPerDays && projectsPerDays !== undefined) {
      for (const key in projectsPerDays) {
        const projectsWithInvoice = projectsPerDays[key];

        let project;
        if (projects[key] !== undefined) {
          project = projects[key];
          project.hours += projectsWithInvoice.hours;
          project.billable += projectsWithInvoice.billable;
          projects[key] = project;
        } else {
          projects[key] = projectsWithInvoice;
        }
      }
    }
  });

  const keys = Object.keys(projects);

  if (!keys || keys.length <= 0) {
    return [];
  }

  // Transform object with keys to an array
  return Object.values(projects);
}
