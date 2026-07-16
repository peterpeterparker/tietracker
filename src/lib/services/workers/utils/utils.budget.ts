import {Project, ProjectId} from '../../../types/project';
import {isNullish, nonNullish} from '../../../utils/utils.nullish';
import {KeyedFilesystemStorage} from '../../storages/filesystem.storage';
import {ExportableInvoices} from './utils.export';

export const updateBudget = async ({
  invoices,
  filterProjectId,
  bill,
}: {
  invoices: Option<ExportableInvoices>;
  filterProjectId: ProjectId;
  bill: boolean;
}) => {
  if (!bill) {
    return;
  }

  const storage = new KeyedFilesystemStorage<Project[]>({key: 'projects'});
  const projects = await storage.get();

  if (isNullish(projects)) {
    return;
  }

  const index = findProjectIndex({projects, filterProjectId});

  if (index < 0) {
    return;
  }

  const project = projects[index];

  if (isNullish(invoices) || invoices.length <= 0) {
    return;
  }

  // The Excel Entries are arrays, see utils.export.ts for positions
  let total = 0;
  invoices.forEach((invoiceArray) => {
    total += invoiceArray.length >= 7 ? (invoiceArray[6] as number) : 0;
  });

  if (total <= 0) {
    return;
  }

  const budget =
    !project.data.budget || isNullish(project.data.budget)
      ? {budget: 0, billed: 0}
      : {...project.data.budget};
  budget.billed = nonNullish(budget.billed) && budget.billed >= 0 ? budget.billed + total : total;

  project.data.budget = budget;
  project.data.updated_at = new Date().getTime();

  projects[index] = project;

  await storage.set(projects);
};

const findProjectIndex = ({
  projects,
  filterProjectId,
}: {
  projects: Option<Project[]>;
  filterProjectId: ProjectId;
}): number => {
  if (isNullish(projects) || projects.length <= 0) {
    return -1;
  }

  const index = projects.findIndex((filteredProject) => {
    return filteredProject.id === filterProjectId;
  });

  if (index < 0) {
    return -1;
  }

  return index;
};
