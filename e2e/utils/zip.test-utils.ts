import {expect} from '@playwright/test';
import JSZip from 'jszip';
import {readFile} from 'node:fs/promises';
import {isNullish} from '../../src/lib/utils/utils.nullish';

export const readZip = async ({filePath}: {filePath: string}): Promise<JSZip> => {
  const buffer = await readFile(filePath);
  return JSZip.loadAsync(buffer);
};

const listJsonEntries = (zip: JSZip): string[] =>
  Object.keys(zip.files)
    .filter((name) => !zip.files[name].dir)
    .filter((name) => name.endsWith('.json'))
    .sort();

export const compareZips = async ({
  actual,
  expected,
}: {
  actual: JSZip;
  expected: JSZip;
}): Promise<void> => {
  const actualEntries = listJsonEntries(actual);
  const expectedEntries = listJsonEntries(expected);

  expect(actualEntries, 'Zip entry list mismatch').toEqual(expectedEntries);

  for (const entryName of expectedEntries) {
    const actualFile = actual.file(entryName);
    const expectedFile = expected.file(entryName);

    if (isNullish(actualFile) || isNullish(expectedFile)) {
      throw new Error(`Missing entry "${entryName}" while comparing zips`);
    }

    const [actualText, expectedText] = await Promise.all([
      actualFile.async('text'),
      expectedFile.async('text'),
    ]);

    const actualJson: unknown = JSON.parse(actualText);
    const expectedJson: unknown = JSON.parse(expectedText);

    if (entryName === 'backup.json') {
      expect(new Date(actualJson as string | number).getTime()).toEqual(
        new Date(expectedJson as string | number).getTime(),
      );
    } else {
      expect(actualJson, `Mismatch in entry "${entryName}"`).toEqual(expectedJson);
    }
  }
};
