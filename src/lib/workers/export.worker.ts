import {IdbStorage} from '../services/_idb.storage';
import {Invoice} from '../store/interfaces/invoice';
import type {Currency} from '../types/currency';
import {DateString} from '../types/date';
import {ProjectId} from '../types/project';
import {Task} from '../types/task';
import {i18nExportLabels} from '../utils/utils.export';
import {isNullish, nonNullish} from '../utils/utils.nullish';
import {loadProjects} from './utils/utils';
import {updateBudget} from './utils/utils.budget';
import {exportToExcel} from './utils/utils.excel';
import {convertTasks, ExportableInvoice, ExportableInvoices} from './utils/utils.export';
import type {WorkerProjects} from './utils/utils.types';

interface ExportWorkerParams {
  invoice: Invoice;
  invoices: DateString[];
  currency: Currency;
  vat: number | undefined;
  bill: boolean;
  signature: string | undefined;
  i18n: i18nExportLabels;
}

export class ExportWorker {
  async export({invoice, bill, ...rest}: ExportWorkerParams): Promise<Option<Blob>> {
    const projects = await loadProjects();

    if (isNullish(projects)) {
      return undefined;
    }

    const results = await this.exportInvoices({
      projects,
      invoice,
      ...rest,
    });

    const {project_id: filterProjectId} = invoice;

    await updateBudget({
      invoices: results.invoices,
      filterProjectId,
      bill,
    });

    // We set all invoices as billed regardless if they contain or not tasks
    await this.billInvoices({
      invoices: results.invoices,
      filterProjectId,
      bill,
    });

    return results.excel;
  }

  private async exportInvoices({
    invoices,
    projects,
    invoice: {client, project_id: filterProjectId},
    ...rest
  }: Omit<ExportWorkerParams, 'bill'> & {
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

  private async billInvoices({
    invoices,
    filterProjectId,
    bill,
  }: {
    invoices: Option<ExportableInvoices>;
    filterProjectId: ProjectId;
    bill: boolean;
  }) {
    const billInvoice = async (invoice: ExportableInvoice) => {
      if (!bill) {
        return;
      }

      const storage = new IdbStorage<Task[]>({key: `tasks-${invoice}`});
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
  }
}
