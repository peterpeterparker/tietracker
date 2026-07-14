import JSZip from 'jszip';
import {IdbStorage, KeyedIdbStorage} from '../storages/idb.storage';
import type {Currency} from '../types/currency';
import {DateString} from '../types/date';
import {Task} from '../types/task';
import {i18nExportLabels} from '../utils/utils.export';
import {isNullish, nonNullish} from '../utils/utils.nullish';
import {loadClients, loadProjects} from './utils/utils';
import {backupToExcel} from './utils/utils.excel';
import {convertTasks, ExportableInvoices} from './utils/utils.export';
import {WorkerClients, WorkerProjects} from './utils/utils.types';

export const backupZip = async (): Promise<Option<Blob>> => {
  const storage = new IdbStorage();
  const entries = await storage.entries();

  if (isNullish(entries) || entries.length <= 0) {
    return undefined;
  }

  const zip = new JSZip();

  entries.forEach((entry) => {
    const blob = new Blob([JSON.stringify(entry[1])], {type: 'application/json'});

    zip.file(`${entry[0]}.json`, blob, {
      base64: true,
    });
  });

  return await zip.generateAsync({type: 'blob'});
};

interface BackupExcelWorkerParams {
  currency: Currency;
  vat: number | undefined;
  signature: string | undefined;
  i18n: i18nExportLabels;
}

export const backupExcel = async (params: BackupExcelWorkerParams): Promise<Option<Blob>> => {
  const storage = new KeyedIdbStorage<DateString[]>({key: 'invoices'});
  const invoices = await storage.get();

  if (isNullish(invoices) || invoices.length <= 0) {
    return undefined;
  }

  const projects = await loadProjects();

  if (isNullish(projects)) {
    return undefined;
  }

  const clients = await loadClients();

  if (isNullish(clients)) {
    return undefined;
  }

  return await backupInvoices({...params, clients, projects, invoices});
};

async function backupInvoices({
  invoices,
  projects,
  clients,
  ...rest
}: BackupExcelWorkerParams & {
  invoices: DateString[];
  projects: WorkerProjects;
  clients: WorkerClients;
}): Promise<Option<Blob>> {
  const promises: Promise<Option<ExportableInvoices>>[] = [];

  invoices.forEach((invoice) => {
    promises.push(backupInvoice({invoice, projects, clients}));
  });

  const allInvoices = await Promise.all(promises);

  if (isNullish(allInvoices) || allInvoices.length <= 0) {
    return undefined;
  }

  const filteredInvoices = allInvoices.filter((tasks) => {
    return nonNullish(tasks) && tasks.length > 0;
  });

  if (!filteredInvoices || filteredInvoices.length <= 0) {
    self.postMessage(undefined);
    return;
  }

  const concatenedInvoices = filteredInvoices
    .filter((invoice) => nonNullish(invoice))
    .reduce((a, b) => a.concat(b), []);

  return await backupToExcel({
    invoices: concatenedInvoices,
    ...rest,
  });
}

const backupInvoice = async ({
  invoice,
  projects,
  clients,
}: {
  invoice: DateString;
  projects: WorkerProjects;
  clients: WorkerClients;
}): Promise<Option<ExportableInvoices>> => {
  const storage = new KeyedIdbStorage<Task[]>({key: `tasks-${invoice}`});
  const tasks = await storage.get();

  if (isNullish(tasks) || tasks.length <= 0) {
    return undefined;
  }

  // Only the tasks which are still not billed
  const filteredTasks = tasks.filter((task) => {
    return task.data.invoice.status === 'open';
  });

  if (filteredTasks.length <= 0) {
    return undefined;
  }

  return convertTasks({
    tasks: filteredTasks,
    projects,
    clients,
  });
};
