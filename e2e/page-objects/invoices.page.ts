import {testIds} from '../../src/lib/tests/test-ids.constants';
import {AppPage} from './app.page';
import {expect} from '@playwright/test';
import {TIMEOUT_AVERAGE} from '../constants/e2e.constants';
import {join} from 'node:path';

export class InvoicesPage extends AppPage {
  async gotoInvoices(): Promise<void> {
    await this.open(testIds.nav.invoices);
  }

  async export(): Promise<void> {
    await this.open(testIds.invoices.open);

    await expect(this.page.getByTestId(testIds.invoices.export)).toBeVisible(
      TIMEOUT_AVERAGE,
    );

    const downloadPromise = this.page.waitForEvent('download');
    await this.page.getByTestId(testIds.invoices.export).click();
    const download = await downloadPromise;

    await download.saveAs(join(process.cwd(), "tmp", "invoice.xlsx"));
  }
}
