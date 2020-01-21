importScripts('./libs/idb-keyval-iife.min.js');
importScripts('./libs/dayjs.min.js');

importScripts('./libs/exceljs.min.js');

importScripts('./utils/utils.js');

self.onmessage = async ($event) => {
    if ($event && $event.data && $event.data.msg === 'export') {
        await self.export($event.data.invoices, $event.data.projectId, $event.data.currency, $event.data.bill);
    }
};

self.export = async (invoices, filterProjectId, currency, bill) => {
    if (!invoices || invoices.length <= 0) {
        self.postMessage(undefined);
        return;
    }

    const projects = await loadProjects();

    if (!projects || projects === undefined) {
        self.postMessage(undefined);
        return;
    }

    self.exportInvoices(invoices, projects, filterProjectId, currency, bill);
    self.billInvoices(invoices, filterProjectId, bill);
};

async function exportInvoices(invoices, projects, filterProjectId, currency, bill) {
    const promises = [];

    invoices.forEach((invoice) => {
        promises.push(exportInvoice(invoice, projects, filterProjectId, currency, bill));
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

    const results = await exportToExcel(concatenedInvoices);

    self.postMessage(results);
}

async function exportToExcel(invoices) {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'Tie Tracker';
    workbook.lastModifiedBy = 'Tie Tracker';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Force workbook calculation on load
    workbook.calcProperties.fullCalcOnLoad = true;

    const worksheet = workbook.addWorksheet('My Sheet', {
        properties: {tabColor: {argb: 'FFC0000'}},
        pageSetup:{paperSize: 9, orientation:'landscape'}
    });

    console.log(invoices);

    worksheet.addTable({
        name: 'MyTable',
        ref: 'A1',
        headerRow: true,
        totalsRow: true,
        style: {
            theme: 'TableStyleDark3',
            showRowStripes: true,
        },
        columns: [
            {name: 'Description', filterButton: true},
            {name: 'From', totalsRowLabel: 'Totals:'},
            {name: 'To', totalsRowLabel: 'Totals:'},
            {name: 'Duration'},
            {name: 'Billable', totalsRowFunction: 'sum', filterButton: false},
        ],
        rows: invoices,
    });

    const buf = await workbook.xlsx.writeBuffer();

    return new Blob([buf]);
}

async function billInvoices(invoices, filterProjectId, bill) {
    const promises = [];

    invoices.forEach((invoice) => {
        promises.push(billInvoice(invoice, filterProjectId, bill));
    });

    await Promise.all(promises);
}

function exportInvoice(invoice, projects, filterProjectId, currency) {
    return new Promise(async (resolve) => {
        const tasks = await idbKeyval.get(`tasks-${invoice}`);

        if (!tasks || tasks.length <= 0) {
            resolve(undefined);
            return;
        }

        // Only the tasks which are still not billed and which has to do with the selected project
        let filteredTasks = tasks.filter((task) => {
            return task.data.invoice.status === 'open' && task.data.project_id === filterProjectId;
        });

        if (!filteredTasks || filteredTasks.length <= 0) {
            resolve(undefined);
            return;
        }

        const results = filteredTasks.map((task) => {
            const milliseconds = dayjs(task.data.to).diff(new Date(task.data.from));
            const hours = milliseconds > 0 ? milliseconds / (1000 * 60 * 60) : 0;

            const rate = projects[task.data.project_id].rate;
            const billable = rate && rate.hourly > 0 ? hours * rate.hourly : 0;

            return [
                task.data.description ? task.data.description : '',
                new Date(task.data.from),
                new Date(task.data.to),
                hours,
                billable
            ]
        });

        if (!results || results.length <= 0) {
            resolve(undefined);
            return;
        }

        resolve(results);
    });
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
