const pageDimensions = {
  height: 595.28,
  width: 841.89,
};

const pageMargin = 48;

const liveArea = {
  width: pageDimensions.width - pageMargin,
  height: pageDimensions.height - pageMargin,
};

const cellPadding = 16;
const textHeight = 3;
const headerLineHeight = 0.3;

const fontSize = 8;

const exportToPdf = async (invoices, client, currency, vat, i18n, signature) => {
  const doc = new jspdf.jsPDF({
    orientation: 'l',
    unit: 'pt',
    format: 'a4',
  });

  doc.setProperties({
    author: signature ? signature : '',
    creator: signature ? signature : '',
  });

  initPDFFonts(doc);

  const columns = initPdfColumns(invoices, i18n, false);

  buildPdfTableColumns(doc, columns);

  let cursorY = buildPdfTableLines(doc, invoices, columns, i18n, currency);

  const total = totalInvoices(invoices);

  cursorY = buildPdfTableLinesTotal(doc, total, columns, i18n, currency, cursorY);

  buildPdfTotal(doc, total, columns, i18n, currency, vat, cursorY);

  buildFooters(doc, signature);

  return new Blob([doc.output('blob')], {type: 'application/pdf'});
};

const initPdfColumns = (invoices, i18n) => {
  const columns = initColumns(invoices, i18n, false);

  const firstColumnLength = liveArea.width * 0.4;
  const columnLength = liveArea.width * 0.08;
  const lastColumnLength = liveArea.width - firstColumnLength - 5 * columnLength - pageMargin;

  const secondColumnX = pageMargin + firstColumnLength;

  const pdfColumns = columns.map((column, index) => {
    return {
      ...column,
      x: index === 0 ? pageMargin : secondColumnX + columnLength * (index - 1),
      width:
        index === 0
          ? firstColumnLength
          : index < columns.length - 1
          ? columnLength
          : lastColumnLength,
    };
  });

  return pdfColumns;
};

const printMilliseconds = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);

  const hours = Math.floor(minutes / 60);
  minutes = minutes % 60;

  return `${hours >= 10 ? hours : '0' + hours}:${minutes >= 10 ? minutes : '0' + minutes}`;
};

const buildPdfTableColumns = (doc, columns) => {
  doc.setFont('helvetica', 'bold');

  columns.forEach((column) => {
    doc.text(column.name, column.x + cellPadding / 2, pageMargin);
  });

  doc.line(pageMargin, pageMargin + textHeight, liveArea.width, pageMargin + textHeight);
};

const buildPdfTableLines = (doc, invoices, columns, i18n, currency) => {
  doc.setFont('helvetica', 'normal');

  const baseYPosForRows = pageMargin + textHeight + headerLineHeight;

  let y = baseYPosForRows;

  invoices
    .map((invoice) => [
      invoice[0],
      dayjs(invoice[1]).format('YYYY-MM-DD'),
      dayjs(invoice[2]).format('HH:mm:ss'),
      dayjs(invoice[3]).format('YYYY-MM-DD'),
      dayjs(invoice[4]).format('HH:mm:ss'),
      printMilliseconds(dayjs(invoice[4]).diff(invoice[2])),
      formatCurrency(invoice[6], i18n, currency),
    ])
    .forEach((invoice, rowIndex) => {
      columns.forEach((column, columnIndex) => {
        const value = invoice[columnIndex];

        if (rowIndex % 2 === 0) {
          doc.setFillColor(217, 217, 217);
          doc.rect(column.x, y, column.width, textHeight + cellPadding, 'F');
        }

        text(value, doc, column, y);
      });

      y = y + textHeight + cellPadding;

      if (y > liveArea.height) {
        doc.addPage();
        y = baseYPosForRows;
      }
    });

  doc.line(pageMargin, y, liveArea.width, y);

  return y;
};

const totalInvoices = (invoices) => {
  const totalDuration = invoices.reduce((accumulator, invoice) => {
    return accumulator + dayjs(invoice[4]).diff(invoice[2]);
  }, 0);

  const sumBillable = invoices.reduce((accumulator, invoice) => {
    return accumulator + invoice[6];
  }, 0);

  return {
    duration: totalDuration,
    sum: sumBillable,
  };
};

const buildPdfTableLinesTotal = (doc, total, columns, i18n, currency, y) => {
  const duration = printMilliseconds(total.duration);
  const billable = formatCurrency(total.sum, i18n, currency);

  doc.setFont('helvetica', 'bold');
  text(duration, doc, columns[5], y);

  doc.setFont('helvetica', 'bold');
  text(billable, doc, columns[6], y);

  y = y + textHeight + cellPadding;

  doc.line(pageMargin, y, liveArea.width, y);

  return y;
};

const buildPdfTotal = (doc, total, columns, i18n, currency, vat, y) => {
  y = y + textHeight + cellPadding;

  // Billable subtotal
  doc.setFont('helvetica', 'normal');
  textTwoColumns(i18n.billable_subtotal, doc, columns[4], columns[5], y);

  const billableSubtotal = formatCurrency(total.sum, i18n, currency);
  text(billableSubtotal, doc, columns[6], y);

  // Total
  y = y + textHeight + textHeight + cellPadding;

  if (vat > 0) {
    y = buildPdfTotalVat(doc, total, columns, i18n, currency, vat, y);
  } else {
    y = buildPdfTotalNoVat(doc, total.sum, columns, i18n, currency, y);
  }

  // Billable hours
  y = y + cellPadding;

  doc.setFont('helvetica', 'normal');
  textTwoColumns(i18n.total_billable_hours, doc, columns[4], columns[5], y);

  const billableHours = printMilliseconds(total.duration);
  text(billableHours, doc, columns[6], y);
};

const buildPdfTotalNoVat = (doc, sum, columns, i18n, currency, y) => {
  doc.setFont('helvetica', 'bold');
  textTwoColumns(i18n.total, doc, columns[4], columns[5], y);

  const billableTotal = formatCurrency(sum, i18n, currency);
  text(billableTotal, doc, columns[6], y);

  y = y + textHeight + cellPadding;

  doc.line(columns[4].x, y, liveArea.width, y);

  return y;
};

const buildPdfTotalVat = (doc, total, columns, i18n, currency, vat, y) => {
  textTwoColumns(i18n.vat_rate, doc, columns[4], columns[5], y);
  text(`${vat}%`, doc, columns[6], y);

  // Total
  y = y + textHeight + textHeight + textHeight + textHeight + cellPadding;

  const totalWithVat = roundCurrency(total.sum * (vat / 100) + total.sum);

  y = buildPdfTotalNoVat(doc, totalWithVat, columns, i18n, currency, y);

  // Total vat
  y = y + textHeight + cellPadding;

  doc.setFont('helvetica', 'normal');
  textTwoColumns(i18n.total_vat_excluded, doc, columns[4], columns[5], y);

  const totalVat = roundCurrency(total.sum * (vat / 100));
  const totalRound = totalWithVat - totalVat;

  const totalVatExcluded = formatCurrency(totalRound, i18n, currency);
  text(totalVatExcluded, doc, columns[6], y);

  // Vat
  y = y + textHeight + cellPadding;

  textTwoColumns(i18n.vat, doc, columns[4], columns[5], y);

  text(formatCurrency(totalVat, i18n, currency), doc, columns[6], y);

  y = y + textHeight + cellPadding;

  return y;
};

const formatCurrency = (value, i18n, currency) => {
  return new Intl.NumberFormat(i18n.language, {style: 'currency', currency: currency.currency})
    .format(value)
    .replace(/\u202f/, ' ');
};

const text = (value, doc, column, y) => {
  const longText = doc.splitTextToSize(value, column.width - cellPadding / 2);
  doc.text(longText, column.x + cellPadding / 2, y + (textHeight + cellPadding / 2));
};

const textTwoColumns = (value, doc, columStart, columnEnd, y) => {
  const longText = doc.splitTextToSize(value, columStart.width + columnEnd.width - cellPadding / 2);
  doc.text(longText, columStart.x + cellPadding / 2, y + (textHeight + cellPadding / 2));
};

// Convert: https://peckconsulting.s3.amazonaws.com/fontconverter/fontconverter.html

const initPDFFonts = (doc) => {
  doc.setFontSize(fontSize);
  doc.setFont('helvetica');
};

const roundCurrency = (value) => {
  return parseFloat((Math.ceil(value * 20 - 0.5) / 20).toFixed(2));
};

const buildFooters = (doc, signature) => {
  const pageCount = doc.internal.getNumberOfPages();

  doc.setFont('helvetica', 'normal');

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(footerText(signature), doc.internal.pageSize.width / 2, liveArea.height, {
      align: 'center',
    });
  }
};
