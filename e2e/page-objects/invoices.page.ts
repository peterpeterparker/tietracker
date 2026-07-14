import {expect} from '@playwright/test';
import {join} from 'node:path';
import {testIds} from '../../src/lib/tests/test-ids.constants';
import {TIMEOUT_AVERAGE} from '../constants/e2e.constants';
import {compareWorkbooks, readWorkbook} from '../utils/excel.utils';
import {AppPage} from './app.page';

export class InvoicesPage extends AppPage {
  readonly #DOWNLOAD_PATH = join(process.cwd(), 'tmp', 'invoice.xlsx');

  async gotoInvoices(): Promise<void> {
    await this.open(testIds.nav.invoices);
  }

  async export(): Promise<void> {
    await this.open(testIds.invoices.open);

    await expect(this.page.getByTestId(testIds.invoices.export)).toBeVisible(TIMEOUT_AVERAGE);

    const downloadPromise = this.page.waitForEvent('download');
    await this.page.getByTestId(testIds.invoices.export).click();
    const download = await downloadPromise;

    await download.saveAs(this.#DOWNLOAD_PATH);
  }

  async assertExcel(): Promise<void> {
    const actual = await readWorkbook({filePath: this.#DOWNLOAD_PATH});

    const fixturePath = join(process.cwd(), 'e2e', 'fixtures', 'invoice.xlsx');
    const expected = await readWorkbook({filePath: fixturePath});

    compareWorkbooks({actual, expected});
  }
}
