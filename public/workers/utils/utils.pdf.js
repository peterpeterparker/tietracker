const pageDimensions = {
  height: 595.28,
  width: 841.89,
};

const pageMargin = 50;

const liveArea = {
  width: pageDimensions.width - pageMargin,
  height: pageDimensions.height - pageMargin,
};

const padding = 15;

const exportToPdf = async (invoices, client, currency, vat, i18n) => {
  const doc = new jspdf.jsPDF({
    orientation: 'l',
    unit: 'pt',
    format: 'a4',
  });

  doc.setFontSize(8);

  const columns = initPdfColumns(invoices, i18n, false);

  buildPdfHeader(doc, columns);

  const baseYPosForRows = pageMargin + padding;
  let nextYPos = baseYPosForRows;

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
    .forEach((invoice) => {
      columns.forEach((column, columnIndex) => {
        const value = invoice[columnIndex];

        const longText = doc.splitTextToSize('' + value, column.width);

        doc.text(longText, column.x, nextYPos);
      });

      nextYPos = nextYPos + padding;

      if (nextYPos > liveArea.height) {
        doc.addPage();
        nextYPos = baseYPosForRows;
      }
    });

  return new Blob([doc.output('blob')], {type: 'application/pdf'});
};

const buildPdfHeader = (doc, columns) => {
  columns.forEach((column) => {
    doc.text(column.name, column.x, pageMargin);
  });

  doc.line(pageMargin, pageMargin + 3.5, liveArea.width, pageMargin + 3.5);
};

const initPdfColumns = (invoices, i18n) => {
  const columns = initColumns(invoices, i18n, false);

  // 30% width
  const firstColumnLength = (liveArea.width - (padding * columns.length - 1)) * 0.28;
  // 10% width
  const columnLength = (liveArea.width - (padding * columns.length - 1)) * 0.1;
  // 20% width
  const lastColumnLength = (liveArea.width - (padding * columns.length - 1)) * 0.1;

  const secondColumnX = pageMargin + firstColumnLength + padding;

  const pdfColumns = columns.map((column, index) => {
    return {
      ...column,
      x: index === 0 ? pageMargin : secondColumnX + (columnLength * index + padding),
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
