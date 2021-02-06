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

  doc.setFontSize(fontSize);

  const columns = initPdfColumns(invoices, i18n, false);

  buildPdfTableColumns(doc, columns);

  buildPdfTableLines(doc, invoices, columns, i18n, currency);

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
    doc.text(column.name, column.x, pageMargin);
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
      new Intl.NumberFormat(i18n.language, {style: 'currency', currency: currency.currency}).format(invoice[6]),
    ])
    .forEach((invoice, rowIndex) => {
      columns.forEach((column, columnIndex) => {
        const value = invoice[columnIndex];

        const longText = doc.splitTextToSize('' + value, column.width - +(cellPadding / 2));

        if (rowIndex % 2 === 0) {
          doc.setFillColor(217, 217, 217);
          doc.rect(column.x, y, column.width, textHeight + cellPadding, 'F');
        }

        doc.text(longText, column.x + cellPadding / 2, y + (textHeight + cellPadding / 2));
      });

      y = y + textHeight + cellPadding;

      if (y > liveArea.height) {
        doc.addPage();
        y = baseYPosForRows;
      }
    });
};
