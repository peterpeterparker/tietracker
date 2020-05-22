function convertTasks(tasks, projects, clients, backup) {
  const results = tasks.map((task, index) => {
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
      {formula: `TEXT(INDIRECT(("${backup ? 'G' : 'E'}" & ROW()))-INDIRECT(("${backup ? 'E' : 'C'}" & ROW())),"hh:mm")`},
      billable,
    ];

    if (clients) {
      return [
        clients[task.data.client_id] ? clients[task.data.client_id].name : '',
        projects[task.data.project_id] ? projects[task.data.project_id].name : '',
        ...result,
      ];
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
  const sumHours = invoices
    .map((invoice, i) => {
      return `${backup ? 'H' : 'F'}${i + 2}`;
    })
    .join('+');

  let columns = [
    {name: i18n.description, filterButton: true, totalsRowLabel: ''},
    {name: i18n.start_date},
    {name: i18n.start_time},
    {name: i18n.end_date},
    {name: i18n.end_time},
    {name: i18n.duration, totalsRowFunction: 'custom', totalsRowFormula: `ROUND((${sumHours})*24,2)`},
    {name: i18n.billable, totalsRowFunction: 'sum'},
  ];

  if (backup) {
    columns = [{name: i18n.client, filterButton: true, totalsRowLabel: ''}, {name: i18n.project, filterButton: true, totalsRowLabel: ''}, ...columns];
  }

  worksheet.addTable({
    name: 'Invoice',
    ref: 'A1',
    headerRow: true,
    totalsRow: true,
    style: {
      theme: 'TableStyleLight1',
      showRowStripes: true,
    },
    columns: columns,
    rows: invoices,
  });

  const col = backup ? 2 : 0;

  invoices.forEach((invoice, i) => {
    // Char ASCII code 66 = B
    worksheet.getCell(`${String.fromCharCode(66 + col)}${i + 2}`).numFmt = 'yyyy-mm-dd';
    worksheet.getCell(`${String.fromCharCode(67 + col)}${i + 2}`).numFmt = 'hh:mm:ss';
    worksheet.getCell(`${String.fromCharCode(68 + col)}${i + 2}`).numFmt = 'yyyy-mm-dd';
    worksheet.getCell(`${String.fromCharCode(69 + col)}${i + 2}`).numFmt = 'hh:mm:ss';
    worksheet.getCell(`${String.fromCharCode(70 + col)}${i + 2}`).alignment = {horizontal: 'right'};
    worksheet.getCell(`${String.fromCharCode(71 + col)}${i + 2}`).numFmt = currencyFormat;
  });

  // Char ASCII code 71 = G
  worksheet.getCell(`${String.fromCharCode(71 + col)}${invoices.length + 2}`).numFmt = currencyFormat;

  if (backup) {
    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 30;
  }

  worksheet.getColumn(1 + col).width = 50;
  worksheet.getColumn(2 + col).width = 10;
  worksheet.getColumn(3 + col).width = 10;
  worksheet.getColumn(4 + col).width = 10;
  worksheet.getColumn(5 + col).width = 10;
  worksheet.getColumn(7 + col).width = 16;
}

function generateTotal(worksheet, invoices, currencyFormat, vat, i18n, backup) {
  let index = invoices.length + 4;

  // Char ASCII code 69 = E
  const e = String.fromCharCode(69 + (backup ? 2 : 0));
  const f = String.fromCharCode(70 + (backup ? 2 : 0));

  // Char ASCII code 71 = G
  const g = String.fromCharCode(71 + (backup ? 2 : 0));

  const billableTotalRef = `${g}${invoices.length + 2}`;

  worksheet.mergeCells(`${e}${index}:${f}${index}`);
  worksheet.getCell(`${e}${index}`).value = i18n.billable_subtotal;
  worksheet.getCell(`${g}${index}`).value = {formula: billableTotalRef};
  worksheet.getCell(`${g}${index}`).numFmt = currencyFormat;

  index++;
  index++;

  if (vat > 0) {
    worksheet.mergeCells(`${e}${index}:${f}${index}`);
    worksheet.getCell(`${e}${index}`).value = i18n.vat_rate;
    worksheet.getCell(`${g}${index}`).value = vat / 100;
    worksheet.getCell(`${g}${index}`).numFmt = '0.00%';

    index++;
    index++;

    const vatRef = `${g}${index - 2}`;

    worksheet.mergeCells(`${e}${index}:${f}${index}`);
    worksheet.getCell(`${e}${index}`).value = i18n.total;
    worksheet.getCell(`${e}${index}`).font = {bold: true};
    worksheet.getCell(`${e}${index}`).border = {bottom: {style: 'thin'}};
    worksheet.getCell(`${g}${index}`).value = {formula: `ROUND((${billableTotalRef}+(${billableTotalRef}*${vatRef}))/5,2)*5`};
    worksheet.getCell(`${g}${index}`).numFmt = currencyFormat;
    worksheet.getCell(`${g}${index}`).font = {bold: true};
    worksheet.getCell(`${g}${index}`).border = {bottom: {style: 'thin'}};

    index++;
    index++;

    const totalRef = `${g}${index - 2}`;

    worksheet.mergeCells(`${e}${index}:${f}${index}`);
    worksheet.getCell(`${e}${index}`).value = i18n.total_vat_excluded;
    worksheet.getCell(`${g}${index}`).value = {formula: `ROUND((${totalRef}*100/(100+(${vatRef}*100)))/5,2)*5`};
    worksheet.getCell(`${g}${index}`).numFmt = currencyFormat;

    index++;

    worksheet.mergeCells(`${e}${index}:${f}${index}`);
    worksheet.getCell(`${e}${index}`).value = i18n.vat;
    worksheet.getCell(`${g}${index}`).value = {formula: `ROUND((${totalRef}*(${vatRef}*100)/(100+(${vatRef}*100)))/5,2)*5`};
    worksheet.getCell(`${g}${index}`).numFmt = currencyFormat;
  } else {
    worksheet.mergeCells(`${e}${index}:${f}${index}`);
    worksheet.getCell(`${e}${index}`).value = i18n.total;
    worksheet.getCell(`${e}${index}`).font = {bold: true};
    worksheet.getCell(`${e}${index}`).border = {bottom: {style: 'thin'}};
    worksheet.getCell(`${g}${index}`).value = {formula: `${billableTotalRef}`};
    worksheet.getCell(`${g}${index}`).numFmt = currencyFormat;
    worksheet.getCell(`${g}${index}`).font = {bold: true};
    worksheet.getCell(`${g}${index}`).border = {bottom: {style: 'thin'}};
  }

  index++;
  index++;

  worksheet.mergeCells(`${e}${index}:${f}${index}`);
  worksheet.getCell(`${e}${index}`).value = i18n.total_billable_hours;
  worksheet.getCell(`${g}${index}`).value = {formula: `${f}${invoices.length + 2}`};
  worksheet.getCell(`${g}${index}`).numFmt = '0.00';
}
