importScripts('./libs/idb-keyval-iife.min.js');
importScripts('./libs/dayjs.min.js');

importScripts('./libs/exceljs.min.js');

importScripts('./utils/utils.js');
importScripts('./utils/utils.export.js');

self.onmessage = async ($event) => {
  if ($event && $event.data && $event.data.msg === 'backup') {
    await self.backup($event.data.currency, $event.data.vat, $event.data.i18n);
  }
};

self.backup = async (currency, vat, i18n) => {
  const invoices = await idbKeyval.get('invoices');

  if (!invoices || invoices.length <= 0) {
    self.postMessage(undefined);
    return;
  }

  if (!i18n) {
    self.postMessage(undefined);
    return;
  }

  const projects = await loadProjects();

  if (!projects || projects === undefined) {
    self.postMessage(undefined);
    return;
  }

  const clients = await loadClients();

  if (!clients || clients === undefined) {
    self.postMessage(undefined);
    return;
  }

  self.backupInvoices(invoices, projects, clients, currency, vat, i18n);
};

async function backupInvoices(invoices, projects, clients, currency, vat, i18n) {
  const promises = [];

  invoices.forEach((invoice) => {
    promises.push(backupInvoice(invoice, projects, clients));
  });

  const allInvoices = await Promise.all(promises);

  if (!allInvoices || allInvoices.length <= 0) {
    self.postMessage(undefined);
    return;
  }

  const filteredInvoices = allInvoices.filter((tasks) => {
    return tasks && tasks !== undefined && tasks.length > 0;
  });

  if (!filteredInvoices || filteredInvoices.length <= 0) {
    self.postMessage(undefined);
    return;
  }

  const concatenedInvoices = filteredInvoices.reduce((a, b) => a.concat(b), []);

  const results = await backupToExcel(concatenedInvoices, currency, vat, i18n);

  self.postMessage(results);
}

function backupInvoice(invoice, projects, clients) {
  return new Promise(async (resolve) => {
    const tasks = await idbKeyval.get(`tasks-${invoice}`);

    if (!tasks || tasks.length <= 0) {
      resolve(undefined);
      return;
    }

    // Only the tasks which are still not billed
    const filteredTasks = tasks.filter((task) => {
      return task.data.invoice.status === 'open';
    });

    if (!filteredTasks || filteredTasks.length <= 0) {
      resolve(undefined);
      return;
    }

    const results = convertTasks(filteredTasks, projects, clients, true);

    if (!results || results.length <= 0) {
      resolve(undefined);
      return;
    }

    resolve(results);
  });
}

async function backupToExcel(invoices, currency, vat, i18n) {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = 'Tie Tracker';
  workbook.lastModifiedBy = 'Tie Tracker';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Force workbook calculation on load
  workbook.calcProperties.fullCalcOnLoad = true;

  const worksheet = workbook.addWorksheet('Tie Tracker Backup', {
    pageSetup: {paperSize: 9, orientation: 'landscape'},
  });

  const currencyFormat = await excelCurrencyFormat(currency);

  extractInvoicesTable(worksheet, invoices, currencyFormat, i18n, true);

  generateTotal(worksheet, invoices, currencyFormat, vat, i18n, true);

  const buf = await workbook.xlsx.writeBuffer();

  return new Blob([buf], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}
