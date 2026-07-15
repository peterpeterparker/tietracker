import {expect} from '@playwright/test';
import {join} from 'node:path';
import {testIds} from '../../src/lib/tests/test-ids.constants';
import {TIMEOUT_AVERAGE} from '../constants/e2e.constants';
import {compareWorkbooks, readWorkbook} from '../utils/excel.utils';
import {AppPage} from './app.page';

export class InvoicesPage extends AppPage {
  readonly #DOWNLOAD_INVOICE_PATH = join(process.cwd(), 'tmp', 'invoice.xlsx');
  readonly #DOWNLOAD_INVOICES_PATH = join(process.cwd(), 'tmp', 'invoices.xlsx');

  async gotoInvoices(): Promise<void> {
    await this.open(testIds.nav.invoices);
  }

  async openInvoiceDetails(): Promise<void> {
    await this.open(testIds.invoices.open);
  }

  async exportInvoice(): Promise<void> {
    await expect(this.page.getByTestId(testIds.invoices.exportInvoice)).toBeVisible(
      TIMEOUT_AVERAGE,
    );

    const downloadPromise = this.page.waitForEvent('download');
    await this.page.getByTestId(testIds.invoices.exportInvoice).click();
    const download = await downloadPromise;

    await download.saveAs(this.#DOWNLOAD_INVOICE_PATH);
  }

  async backupInvoices(): Promise<void> {
    await expect(this.page.getByTestId(testIds.invoices.backupInvoices)).toBeVisible(
      TIMEOUT_AVERAGE,
    );

    const downloadPromise = this.page.waitForEvent('download');
    await this.page.getByTestId(testIds.invoices.backupInvoices).click();
    const download = await downloadPromise;

    await download.saveAs(this.#DOWNLOAD_INVOICES_PATH);
  }

  async assertInvoiceContent(): Promise<void> {
    const actual = await readWorkbook({filePath: this.#DOWNLOAD_INVOICE_PATH});

    const fixturePath = join(process.cwd(), 'e2e', 'fixtures', 'invoice.xlsx');
    const expected = await readWorkbook({filePath: fixturePath});

    compareWorkbooks({actual, expected});
  }

  async assertInvoicesContent(): Promise<void> {
    const actual = await readWorkbook({filePath: this.#DOWNLOAD_INVOICES_PATH});

    const fixturePath = join(process.cwd(), 'e2e', 'fixtures', 'invoices.xlsx');
    const expected = await readWorkbook({filePath: fixturePath});

    compareWorkbooks({actual, expected});
  }

  async assertProjectInvoicesLoaded(): Promise<void> {
    await this.page.waitForTimeout(1000);

    await expect(this.page.locator('body')).not.toContainText(
      'For the selected period nothing can be billed.',
    );

    await expect(this.page.locator('body')).not.toContainText(
      'For the selected period 1 648,67 CHF can be billed, i.e. 82h 26min or 17 % of the maximal budget.',
    );

    await expect(this.page.locator('body')).not.toContainText(
      '10 188,67 CHF will have been invoiced.',
    );
  }
}
