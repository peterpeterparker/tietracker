import {expect} from '@playwright/test';
import ExcelJS from 'exceljs';
import {isNullish} from '../../src/lib/utils/utils.nullish';

const normalizeCellValue = (value: ExcelJS.CellValue): unknown => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value && typeof value === 'object' && 'result' in value) {
    return normalizeCellValue((value as ExcelJS.CellFormulaValue).result as ExcelJS.CellValue);
  }

  return value;
};

export const readWorkbook = async ({filePath}: {filePath: string}): Promise<ExcelJS.Workbook> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  return workbook;
};

export const compareWorkbooks = ({
  actual,
  expected,
}: {
  actual: ExcelJS.Workbook;
  expected: ExcelJS.Workbook;
}) => {
  const actualSheetNames = actual.worksheets.map((sheet) => sheet.name);
  const expectedSheetNames = expected.worksheets.map((sheet) => sheet.name);

  expect(actualSheetNames).toEqual(expectedSheetNames);

  for (const expectedSheet of expected.worksheets) {
    const actualSheet = actual.getWorksheet(expectedSheet.name);

    if (isNullish(actualSheet)) {
      throw new Error(`Missing sheet "${expectedSheet.name}" in actual workbook`);
    }

    const rowCount = Math.max(actualSheet.rowCount, expectedSheet.rowCount);
    const colCount = Math.max(actualSheet.columnCount, expectedSheet.columnCount);

    for (let r = 1; r <= rowCount; r++) {
      for (let c = 1; c <= colCount; c++) {
        const actualValue = normalizeCellValue(actualSheet.getCell(r, c).value);
        const expectedValue = normalizeCellValue(expectedSheet.getCell(r, c).value);

        expect(
          actualValue,
          `Mismatch in sheet "${expectedSheet.name}" at cell (row ${r}, col ${c}): expected ${JSON.stringify(expectedValue)}, got ${JSON.stringify(actualValue)}`,
        ).toEqual(expectedValue);
      }
    }
  }
};
