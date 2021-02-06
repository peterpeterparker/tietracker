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
const headerLineHeight = 1;

const fontSize = 8;

const exportToPdf = async (invoices, client, currency, vat, i18n) => {
  const doc = new jspdf.jsPDF({
    orientation: 'l',
    unit: 'pt',
    format: 'a4',
  });

  initPDFFonts(doc);

  const columns = initPdfColumns(invoices, i18n, false);

  buildPdfTableColumns(doc, columns);

  const cursorY = buildPdfTableLines(doc, invoices, columns, i18n, currency);

  buildPdfTableLinesTotal(doc, invoices, columns, i18n, currency, cursorY);

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
      width: index === 0 ? firstColumnLength : index < columns.length - 1 ? columnLength : lastColumnLength,
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
  columns.forEach((column) => {
    doc.text(column.name, column.x + cellPadding / 2, pageMargin);
  });

  doc.line(pageMargin, pageMargin + textHeight, liveArea.width, pageMargin + textHeight);
};

const buildPdfTableLines = (doc, invoices, columns, i18n, currency) => {
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

const buildPdfTableLinesTotal = (doc, invoices, columns, i18n, currency, y) => {
  const totalDuration = invoices.reduce((accumulator, invoice) => {
    return accumulator + dayjs(invoice[4]).diff(invoice[2]);
  }, 0);

  const sumBillable = invoices.reduce((accumulator, invoice) => {
    return accumulator + invoice[6];
  }, 0);

  const duration = printMilliseconds(totalDuration);
  const billable = formatCurrency(sumBillable, i18n, currency);

  doc.setFont('helvetica', 'bold');
  text(duration, doc, columns[5], y);

  doc.setFont('helvetica', 'bold');
  text(billable, doc, columns[6], y);

  y = y + textHeight + cellPadding;

  doc.line(pageMargin, y, liveArea.width, y);

  return y;
};

const formatCurrency = (value, i18n, currency) => {
  return new Intl.NumberFormat(i18n.language, {style: 'currency', currency: currency.currency}).format(value);
};

const text = (value, doc, column, y) => {
  const longText = doc.splitTextToSize(value, column.width - cellPadding / 2);
  doc.text(longText, column.x + cellPadding / 2, y + (textHeight + cellPadding / 2));
};

// Convert: https://peckconsulting.s3.amazonaws.com/fontconverter/fontconverter.html

const initPDFFonts = (doc) => {
  doc.setFontSize(fontSize);
  doc.setFont('helvetica');
};
