importScripts('./libs/idb-keyval-iife.min.js');
importScripts('./libs/dayjs.min.js');

importScripts('./libs/exceljs.min.js');

importScripts('./utils/utils.js');

self.onmessage = async ($event) => {
    if ($event && $event.data && $event.data.msg === 'export') {
        await self.export($event.data.invoices, $event.data.projectId, $event.data.currency, $event.data.vat, $event.data.bill, $event.data.client, $event.data.i18n);
    }
};

self.export = async (invoices, filterProjectId, currency, vat, bill, client, i18n) => {
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

    self.exportInvoices(invoices, projects, filterProjectId, currency, vat, client, i18n);
    self.billInvoices(invoices, filterProjectId, bill);
};

async function exportInvoices(invoices, projects, filterProjectId, currency, vat, client, i18n) {
    const promises = [];

    invoices.forEach((invoice) => {
        promises.push(exportInvoice(invoice, projects, filterProjectId));
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

    const results = await exportToExcel(concatenedInvoices, client, currency, vat, i18n);

    self.postMessage(results);
}

async function exportToExcel(invoices, client, currency, vat, i18n) {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'Tie Tracker';
    workbook.lastModifiedBy = 'Tie Tracker';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Force workbook calculation on load
    workbook.calcProperties.fullCalcOnLoad = true;

    const worksheet = workbook.addWorksheet(client.name, {
        properties: {tabColor: {argb: client.color ? client.color.replace('#', '') : undefined}},
        pageSetup: {paperSize: 9, orientation: 'landscape'}
    });

    const currencyFormat = await excelCurrencyFormat(currency);

    extractInvoicesTable(worksheet, invoices, currencyFormat, i18n);

    generateTotal(worksheet, invoices, currencyFormat, vat, i18n);

    const buf = await workbook.xlsx.writeBuffer();

    return new Blob([buf], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}

function generateTotal(worksheet, invoices, currencyFormat, vat, i18n) {
    let index = invoices.length + 4;

    const billableTotalRef = `G${invoices.length + 2}`;

    worksheet.mergeCells(`E${index}:F${index}`);
    worksheet.getCell(`E${index}`).value = i18n.billable_subtotal;
    worksheet.getCell(`G${index}`).value = {formula: billableTotalRef};
    worksheet.getCell(`G${index}`).numFmt = currencyFormat;

    index++;
    index++;

    if (vat > 0) {
        worksheet.mergeCells(`E${index}:F${index}`);
        worksheet.getCell(`E${index}`).value = i18n.vat_rate;
        worksheet.getCell(`G${index}`).value = vat / 100;
        worksheet.getCell(`G${index}`).numFmt = '0.00%';

        index++;
        index++;

        const vatRef = `G${index - 2}`;

        worksheet.mergeCells(`E${index}:F${index}`);
        worksheet.getCell(`E${index}`).value = i18n.total;
        worksheet.getCell(`E${index}`).font = {bold: true};
        worksheet.getCell(`E${index}`).border = {bottom: {style:'thin'}};
        worksheet.getCell(`G${index}`).value = {formula: `${billableTotalRef}+(${billableTotalRef}*${vatRef})`};
        worksheet.getCell(`G${index}`).numFmt = currencyFormat;
        worksheet.getCell(`G${index}`).font = {bold: true};
        worksheet.getCell(`G${index}`).border = {bottom: {style:'thin'}};

        index++;
        index++;

        const totalRef = `G${index - 2}`;

        worksheet.mergeCells(`E${index}:F${index}`);
        worksheet.getCell(`E${index}`).value = i18n.total_vat_excluded;
        worksheet.getCell(`G${index}`).value = {formula: `${totalRef}*100/(100+(${vatRef}*100))`};
        worksheet.getCell(`G${index}`).numFmt = currencyFormat;

        index++;

        worksheet.mergeCells(`E${index}:F${index}`);
        worksheet.getCell(`E${index}`).value = i18n.vat;
        worksheet.getCell(`G${index}`).value = {formula: `${totalRef}*(${vatRef}*100)/(100+(${vatRef}*100))`};
        worksheet.getCell(`G${index}`).numFmt = currencyFormat;
    } else {
        worksheet.mergeCells(`E${index}:F${index}`);
        worksheet.getCell(`E${index}`).value = i18n.total;
        worksheet.getCell(`E${index}`).font = {bold: true};
        worksheet.getCell(`E${index}`).border = {bottom: {style:'thin'}};
        worksheet.getCell(`G${index}`).value = {formula: `${billableTotalRef}`};
        worksheet.getCell(`G${index}`).numFmt = currencyFormat;
        worksheet.getCell(`G${index}`).font = {bold: true};
        worksheet.getCell(`G${index}`).border = {bottom: {style:'thin'}};
    }

    index++;
    index++;

    worksheet.mergeCells(`E${index}:F${index}`);
    worksheet.getCell(`E${index}`).value = i18n.total_billable_hours;
    worksheet.getCell(`G${index}`).value = {formula: `F${invoices.length + 2}`};
    worksheet.getCell(`G${index}`).numFmt = '0.00';
}

function extractInvoicesTable(worksheet, invoices, currencyFormat, i18n) {
    worksheet.addTable({
        name: 'Invoice',
        ref: 'A1',
        headerRow: true,
        totalsRow: true,
        style: {
            theme: 'TableStyleLight1',
            showRowStripes: true
        },
        columns: [
            {name: i18n.description, filterButton: true, totalsRowLabel: ''},
            {name: i18n.start_date},
            {name: i18n.start_time},
            {name: i18n.end_date},
            {name: i18n.end_time},
            {name: i18n.duration, totalsRowFunction: 'sum'},
            {name: i18n.billable, totalsRowFunction: 'sum'},
        ],
        rows: invoices,
    });

    invoices.forEach((invoice, i) => {
        worksheet.getCell(`B${i + 2}`).numFmt = 'yyyy-mm-dd';
        worksheet.getCell(`C${i + 2}`).numFmt = 'hh:mm:ss';
        worksheet.getCell(`D${i + 2}`).numFmt = 'yyyy-mm-dd';
        worksheet.getCell(`E${i + 2}`).numFmt = 'hh:mm:ss';
        worksheet.getCell(`F${i + 2}`).numFmt = '0.00';
        worksheet.getCell(`G${i + 2}`).numFmt = currencyFormat;
    });

    worksheet.getCell(`F${invoices.length + 2}`).numFmt = '0.00';
    worksheet.getCell(`G${invoices.length + 2}`).numFmt = currencyFormat;

    worksheet.getColumn(1).width = 50;
    worksheet.getColumn(2).width = 10;
    worksheet.getColumn(3).width = 10;
    worksheet.getColumn(4).width = 10;
    worksheet.getColumn(5).width = 10;
    worksheet.getColumn(7).width = 16;
}

function excelCurrencyFormat(currency) {
    return new Promise(async (resolve) => {
        if (!currency || !currency.currency) {
            resolve(`#,##0.00 CHF`);
            return;
        }

        if (!currency.format || !currency.format.symbol || !currency.format.symbol.template || !currency.format.symbol.grapheme) {
            resolve(`#,##0.00 \"${currency.currency}\"`);
            return;
        }

        const symbol = currency.format.symbol.template.replace('$', currency.format.symbol.grapheme);
        const format = symbol.replace('1', '#,##0.00');

        resolve(format);
    });
}

async function billInvoices(invoices, filterProjectId, bill) {
    const promises = [];

    invoices.forEach((invoice) => {
        promises.push(billInvoice(invoice, filterProjectId, bill));
    });

    await Promise.all(promises);
}

function exportInvoice(invoice, projects, filterProjectId) {
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
                new Date(task.data.from),
                new Date(task.data.to),
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
