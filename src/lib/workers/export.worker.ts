import {IdbStorage} from '../services/_idb.storage';
import {Invoice} from '../store/interfaces/invoice';
import type {Currency} from '../types/currency';
import {DateString} from '../types/date';
import {ProjectId} from '../types/project';
import {Task} from '../types/task';
import {isNullish, nonNullish} from '../utils/utils.nullish';
import {convertTasks, ExportableInvoices} from './utils/utils.export';
import type {WorkerProjects} from './utils/utils.types';
import {exportToExcel} from './utils/utils.excel';
import {i18nExportLabels} from '../utils/utils.export';
import {loadProjects} from './utils/utils';

interface ExportWorkerParams {
  invoice: Invoice;
  invoices: DateString[];
  currency: Currency;
  vat: number | undefined;
  bill: boolean;
  signature: string | undefined;
  i18n: i18nExportLabels
}

export class ExportWorker {
  async export(args: ExportWorkerParams) {
    const projects = await loadProjects();

    if (isNullish(projects)) {
      return;
    }

    const results = await this.exportInvoices({
      projects,
      ...args,
    });

    await updateBudget(results.invoices, filterProjectId, bill);

    // We set all invoices as billed regardless if they contain or not tasks
    await self.billInvoices(invoices, filterProjectId, bill);

    self.postMessage(results.excel);
  }

  private async exportInvoices({
    invoices,
    projects,
    invoice: {client, project_id: filterProjectId},
    ...rest
  }: ExportWorkerParams & {
    projects: WorkerProjects;
  }): Promise<{excel: Option<Blob>; invoices: Option<ExportableInvoices>}> {
    const promises: Promise<Option<ExportableInvoices>>[] = [];

    invoices.forEach((invoice) => {
      promises.push(this.exportInvoice({invoice, projects, filterProjectId}));
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

    const results = await exportToExcel({
      invoices: concatenedInvoices,
      client,
      ...rest,
    });

    return {
      excel: results,
      invoices: concatenedInvoices,
    };
  }

  async exportInvoice({
    invoice,
    projects,
    filterProjectId,
  }: {
    invoice: DateString;
    projects: WorkerProjects;
    filterProjectId: ProjectId;
  }): Promise<Option<ExportableInvoices>> {
    const storage = new IdbStorage<Task[]>({key: `tasks-${invoice}`});
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
  }
}

async function billInvoices(invoices, filterProjectId, bill) {
  const promises = [];

  invoices.forEach((invoice) => {
    promises.push(billInvoice(invoice, filterProjectId, bill));
  });

  await Promise.all(promises);
}

function billInvoice(invoice, filterProjectId, bill) {
  return new Promise(async (resolve) => {
    if (!bill) {
      resolve();
      return;
    }

    const tasks = await idbKeyval.get(`tasks-${invoice}`);

    if (!tasks || tasks.length <= 0) {
      resolve();
      return;
    }

    tasks.forEach((task) => {
      if (task.data.invoice.status === 'open' && task.data.project_id === filterProjectId) {
        task.data.invoice.status = 'billed';
        task.data.updated_at = new Date().getTime();
      }
    });

    await idbKeyval.set(`tasks-${invoice}`, tasks);

    resolve();
  });
}
