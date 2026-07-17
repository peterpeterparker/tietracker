import {Invoice} from '../../store/interfaces/invoice';
import {DateString} from '../../types/date';
import {ProjectId} from '../../types/project';
import {Settings} from '../../types/settings';
import {Task} from '../../types/task';
import {i18nExportLabels} from '../../utils/utils.export';
import {isNullish, nonNullish} from '../../utils/utils.nullish';
import {directory} from '../helpers/settings.helper';
import {KeyedFilesystemStorage} from '../storages/filesystem.storage';
import {loadProjects} from './utils/utils';
import {updateBudget} from './utils/utils.budget';
import {exportToExcel} from './utils/utils.excel';
import {convertTasks, ExportableInvoices} from './utils/utils.export';
import type {WorkerProjects} from './utils/utils.types';

interface ExportWorkerParams {
  invoice: Invoice;
  invoices: DateString[];
  bill: boolean;
  i18n: i18nExportLabels;
  settings: Settings;
}

export const exportInvoices = async ({
  invoice,
  invoices,
  bill,
  settings,
  ...rest
}: ExportWorkerParams): Promise<Option<Blob>> => {
  const projects = await loadProjects({settings});

  if (isNullish(projects)) {
    return undefined;
  }

  const results = await exportProjectsInvoices({
    projects,
    invoice,
    invoices,
    settings,
    ...rest,
  });

  const {project_id: filterProjectId} = invoice;

  await updateBudget({
    invoices: results.invoices,
    filterProjectId,
    bill,
    settings,
  });

  // We set all invoices as billed regardless if they contain or not tasks
  await billInvoices({
    invoices,
    filterProjectId,
    bill,
    settings,
  });

  return results.excel;
};

const exportProjectsInvoices = async ({
  invoices,
  projects,
  invoice: {client, project_id: filterProjectId},
  settings,
  ...rest
}: Omit<ExportWorkerParams, 'bill'> & {
  projects: WorkerProjects;
}): Promise<{excel: Option<Blob>; invoices: Option<ExportableInvoices>}> => {
  const promises: Promise<Option<ExportableInvoices>>[] = [];

  invoices.forEach((invoice) => {
    promises.push(exportInvoice({invoice, projects, filterProjectId, settings}));
  });

  const allInvoices = await Promise.all(promises);

  if (isNullish(allInvoices) || allInvoices.length <= 0) {
    return {
      excel: undefined,
      invoices: undefined,
    };
  }

  const filteredInvoices = allInvoices.filter((tasks) => {
    return nonNullish(tasks) && tasks.length > 0;
  });

  if (isNullish(filteredInvoices) || filteredInvoices.length <= 0) {
    return {
      excel: undefined,
      invoices: undefined,
    };
  }

  const concatenedInvoices = filteredInvoices
    .filter((invoice) => nonNullish(invoice))
    .reduce((a, b) => a.concat(b), []);

  const {currency, vat, signature} = settings;

  const results = await exportToExcel({
    invoices: concatenedInvoices,
    client,
    currency,
    vat,
    signature,
    ...rest,
  });

  return {
    excel: results,
    invoices: concatenedInvoices,
  };
};

const exportInvoice = async ({
  invoice,
  projects,
  filterProjectId,
  settings,
}: {
  invoice: DateString;
  projects: WorkerProjects;
  filterProjectId: ProjectId;
  settings: Settings;
}): Promise<Option<ExportableInvoices>> => {
  const storage = new KeyedFilesystemStorage<Task[]>({
    key: `tasks-${invoice}`,
    ...directory(settings),
  });
  const tasks = await storage.get();

  if (isNullish(tasks) || tasks.length <= 0) {
    return undefined;
  }

  // Only the tasks which are still not billed and which has to do with the selected project
  const filteredTasks = tasks.filter((task) => {
    return task.data.invoice.status === 'open' && task.data.project_id === filterProjectId;
  });

  if (filteredTasks.length <= 0) {
    return undefined;
  }

  return convertTasks({
    tasks: filteredTasks,
    projects,
    clients: undefined,
  });
};

const billInvoices = async ({
  invoices,
  filterProjectId,
  bill,
  settings,
}: {
  filterProjectId: ProjectId;
  bill: boolean;
} & Pick<ExportWorkerParams, 'invoices' | 'settings'>) => {
  const billInvoice = async (invoice: DateString) => {
    if (!bill) {
      return;
    }

    const storage = new KeyedFilesystemStorage<Task[]>({
      key: `tasks-${invoice}`,
      ...directory(settings),
    });
    const tasks = await storage.get();

    if (isNullish(tasks) || tasks.length <= 0) {
      return;
    }

    tasks.forEach((task) => {
      if (task.data.invoice.status === 'open' && task.data.project_id === filterProjectId) {
        task.data.invoice.status = 'billed';
        task.data.updated_at = new Date().getTime();
      }
    });

    await storage.set(tasks);
  };

  const promises = (invoices ?? []).map(billInvoice);
  await Promise.all(promises);
};
