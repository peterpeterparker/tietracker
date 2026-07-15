import {differenceInMilliseconds, isAfter, isBefore, isSameDay, startOfDay} from 'date-fns';
import {CLIENT_COLOR_FALLBACK} from '../../constants';
import {Invoice} from '../../store/interfaces/invoice';
import {DateString} from '../../types/date';
import {ProjectId} from '../../types/project';
import {Task} from '../../types/task';
import {Result} from '../../utils/utils.fn';
import {isNullish, nonNullish} from '../../utils/utils.nullish';
import {KeyedFilesystemStorage} from '../storages/filesystem.storage';
import {loadClients, loadProjects} from './utils/utils';
import {WorkerClients, WorkerProjects} from './utils/utils.types';

export const listProjectsInvoices = async (): Promise<Invoice[]> => {
  const storage = new KeyedFilesystemStorage<DateString[]>({key: 'invoices'});
  const invoices = await storage.get();

  return await listInvoices({invoices, filterProjectId: null});
};

export const closeInvoices = async ({
  from,
  to,
}: {
  from: Date;
  to: Date;
}): Promise<Result<undefined>> => {
  const selectedInvoices = await findInvoicesForPeriod({from, to});

  if (isNullish(selectedInvoices) || selectedInvoices.length <= 0) {
    return {status: 'error', err: new Error('No period to close.')};
  }

  const checkInvoices = selectedInvoices.map((invoice) => hasOpenInvoices({invoice}));
  const checks = await Promise.all(checkInvoices);

  const hasOpenInvoice = checks.find((check) => check === true);
  if (hasOpenInvoice) {
    return {
      status: 'error',
      err: new Error(
        'Period cannot be closed. It contains an invoice that still need to be billed.',
      ),
    };
  }

  await removeInvoicesForPeriod({selectedInvoices});

  return {status: 'success', result: undefined};
};

const removeInvoicesForPeriod = async ({selectedInvoices}: {selectedInvoices: DateString[]}) => {
  const storage = new KeyedFilesystemStorage<DateString[]>({key: 'invoices'});
  const invoices = await storage.get();

  const filterInvoices = (invoices ?? []).filter((invoice) => !selectedInvoices.includes(invoice));

  await storage.set(filterInvoices);
};

const findInvoicesForPeriod = async ({
  from,
  to,
}: {
  from: Date;
  to: Date;
}): Promise<Option<DateString[]>> => {
  const storage = new KeyedFilesystemStorage<DateString[]>({key: 'invoices'});
  const invoices = await storage.get();

  return invoices?.filter((invoice) => {
    const invoiceDate = new Date(invoice);

    if (isSameDay(invoiceDate, from) || isSameDay(invoiceDate, to)) {
      return true;
    }

    return (
      isBefore(startOfDay(invoiceDate), startOfDay(to)) &&
      isAfter(startOfDay(invoiceDate), startOfDay(from))
    );
  });
};

const hasOpenInvoices = async ({invoice}: {invoice: DateString}): Promise<boolean> => {
  const storage = new KeyedFilesystemStorage<Task[]>({key: `tasks-${invoice}`});
  const tasks = await storage.get();

  if (isNullish(tasks) || tasks.length <= 0) {
    return false;
  }

  const task = tasks.find((task) => {
    return task.data.invoice.status === 'open';
  });

  return nonNullish(task);
};

export const listProjectInvoice = async ({
  invoices,
  projectId,
}: {
  invoices: Option<DateString[]>;
  projectId: ProjectId;
}): Promise<Option<Invoice>> => {
  const [invoice] = await listInvoices({invoices, filterProjectId: projectId});
  return invoice;
};

const listInvoices = async ({
  invoices,
  filterProjectId,
}: {
  invoices: Option<DateString[]>;
  filterProjectId: Nullable<ProjectId>;
}): Promise<Invoice[]> => {
  if (isNullish(invoices) || invoices.length <= 0) {
    return [];
  }

  const projects = await loadProjects();

  if (isNullish(projects)) {
    return [];
  }

  const clients = await loadClients();

  if (isNullish(clients)) {
    return [];
  }

  const projectsWithInvoices = await listBillableProjects({
    invoices,
    projects,
    clients,
    filterProjectId,
  });

  return reduceAllProjects({projectsWithInvoices});
};

async function listBillableProjects({
  invoices,
  ...rest
}: {
  invoices: DateString[];
  projects: WorkerProjects;
  clients: WorkerClients;
  filterProjectId: Nullable<ProjectId>;
}): Promise<Option<ProjectsWithInvoice>[]> {
  const promises: Promise<Option<ProjectsWithInvoice>>[] = [];

  invoices.forEach((invoice) => {
    promises.push(buildProject({invoice, ...rest}));
  });

  return await Promise.all(promises);
}

type ProjectsWithInvoice = Record<ProjectId, Invoice>;

const buildProject = async ({
  invoice,
  projects,
  clients,
  filterProjectId,
}: {
  invoice: DateString;
  projects: WorkerProjects;
  clients: WorkerClients;
  filterProjectId: Nullable<ProjectId>;
}): Promise<Option<ProjectsWithInvoice>> => {
  const storage = new KeyedFilesystemStorage<Task[]>({key: `tasks-${invoice}`});
  const tasks = await storage.get();

  if (isNullish(tasks) || tasks.length <= 0) {
    return undefined;
  }

  // Only the tasks which are still not billed
  let filteredTasks = tasks.filter((task) => {
    return task.data.invoice.status === 'open';
  });

  if (filteredTasks.length <= 0) {
    return undefined;
  }

  if (nonNullish(filterProjectId)) {
    filteredTasks = filteredTasks.filter((task) => {
      return task.data.project_id === filterProjectId;
    });

    if (filteredTasks.length <= 0) {
      return undefined;
    }
  }

  const results: ProjectsWithInvoice = {};

  filteredTasks.forEach((task) => {
    const milliseconds = differenceInMilliseconds(
      new Date(task.data.to ?? Date.now()),
      new Date(task.data.from),
    );
    const hours = milliseconds > 0 ? milliseconds / (1000 * 60 * 60) : 0;

    const rate = projects[task.data.project_id].rate;

    const billable = rate && rate.hourly > 0 ? hours * rate.hourly : 0;

    if (results[task.data.project_id] !== undefined) {
      const project = results[task.data.project_id];
      project.hours += hours;
      project.billable += billable;
    } else if (
      nonNullish(clients?.[task.data.client_id]) &&
      nonNullish(projects?.[task.data.project_id])
    ) {
      const {color, ...client} = clients[task.data.client_id];

      const project: Invoice = {
        client_id: task.data.client_id,
        project_id: task.data.project_id,
        client: {
          ...client,
          color: color ?? CLIENT_COLOR_FALLBACK,
        },
        project: projects[task.data.project_id],
        hours: hours,
        billable: billable,
      };

      results[task.data.project_id] = project;
    }
  });

  return results;
};

const reduceAllProjects = ({
  projectsWithInvoices,
}: {
  projectsWithInvoices: Option<ProjectsWithInvoice>[];
}): Invoice[] => {
  if (isNullish(projectsWithInvoices) || projectsWithInvoices.length <= 0) {
    return [];
  }

  const projects: ProjectsWithInvoice = {};

  // Iterate on all days containing x projects
  projectsWithInvoices.forEach((projectsPerDays) => {
    // Sum up, reduce projects to one key per project
    if (nonNullish(projectsPerDays)) {
      for (const key in projectsPerDays) {
        const projectsWithInvoice = projectsPerDays[key];

        if (projects[key] !== undefined) {
          const project = projects[key];
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
};
