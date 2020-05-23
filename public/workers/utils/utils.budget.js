async function updateBudget(invoices, filterProjectId, bill) {
  if (!bill) {
    return;
  }

  const projects = await idbKeyval.get(`projects`);

  const index = await findProjectIndex(projects, filterProjectId);

  if (index === undefined || index < 0) {
    return;
  }

  const project = projects[index];

  if (invoices === undefined || invoices.length <= 0) {
    return;
  }

  // The Excel Entries are arrays, see utils.export.js for positions
  let total = 0;
  invoices.forEach((invoiceArray) => {
    total += invoiceArray.length >= 7 ? invoiceArray[6] : 0;
  });

  if (total === undefined || total <= 0) {
    return;
  }

  const budget = !project.data.budget || project.data.budget === undefined ? {budget: 0, billed: 0} : {...project.data.budget};
  budget.billed = budget.billed !== undefined && budget.billed >= 0 ? budget.billed + total : total;

  project.data.budget = budget;
  project.data.updated_at = new Date().getTime();

  projects[index] = project;

  await idbKeyval.set(`projects`, projects);
}

async function findProjectIndex(projects, filterProjectId) {
  if (projects === undefined || projects.length <= 0) {
    return -1;
  }

  const index = projects.findIndex((filteredProject) => {
    return filteredProject.id === filterProjectId;
  });

  if (index < 0) {
    return -1;
  }

  return index;
}
