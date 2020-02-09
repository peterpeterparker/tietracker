function convertTasks(tasks, projects, clients) {

    const results = tasks.map((task) => {
        const milliseconds = dayjs(task.data.to).diff(new Date(task.data.from));
        const hours = milliseconds > 0 ? milliseconds / (1000 * 60 * 60) : 0;

        const rate = projects[task.data.project_id].rate;
        const billable = rate && rate.hourly > 0 ? hours * rate.hourly : 0;

        // #47: ExcelJS timezone workaround
        const from = dayjs(task.data.from).add(dayjs().utcOffset(), 'minute').toDate();
        const to = dayjs(task.data.to).add(dayjs().utcOffset(), 'minute').toDate();

        const result = [
            task.data.description ? task.data.description : '',
            new Date(from),
            new Date(from),
            new Date(to),
            new Date(to),
            hours,
            billable
        ];

        console.log(clients && clients.length > 0);

        if (clients) {
            return [
                clients[task.data.client_id] ? clients[task.data.client_id].name : '',
                projects[task.data.project_id] ? projects[task.data.project_id].name : '',
                ...result
            ]
        } else {
            return result;
        }
    });

    return results;
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

function extractInvoicesTable(worksheet, invoices, currencyFormat, i18n, backup) {
    let columns = [
        {name: i18n.description, filterButton: true, totalsRowLabel: ''},
        {name: i18n.start_date},
        {name: i18n.start_time},
        {name: i18n.end_date},
        {name: i18n.end_time},
        {name: i18n.duration, totalsRowFunction: 'sum'},
        {name: i18n.billable, totalsRowFunction: 'sum'},
    ];

    if (backup) {
        columns = [
            {name: i18n.client, filterButton: true, totalsRowLabel: ''},
            {name: i18n.project, filterButton: true, totalsRowLabel: ''},
            ...columns
        ];
    }

    worksheet.addTable({
        name: 'Invoice',
        ref: 'A1',
        headerRow: true,
        totalsRow: true,
        style: {
            theme: 'TableStyleLight1',
            showRowStripes: true
        },
        columns: columns,
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
