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

  invoices.forEach((invoice) => {
    columns.forEach((column, columnIndex) => {
      const value = invoice[columnIndex];

      const longText = doc.splitTextToSize('' + value, column.width);

      doc.text(longText, column.x, nextYPos);
    });

    nextYPos = nextYPos + padding + 30;

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
  const firstColumnLength = (liveArea.width - (padding * columns.length - 1)) * 0.3;
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
