import {expect} from '@playwright/test';
import {testIds} from '../../src/lib/tests/test-ids.constants';
import {TIMEOUT_AVERAGE, TIMEOUT_SHORT} from '../constants/e2e.constants';
import {AppPage} from './app.page';

export class InvoicesPage extends AppPage {
  async gotoInvoices(): Promise<void> {
    await expect(this.page.getByTestId(testIds.nav.invoices)).toBeVisible(TIMEOUT_AVERAGE);
    await this.page.getByTestId(testIds.nav.invoices).click();
  }

  async export(): Promise<void> {
    await expect(this.page.getByTestId(testIds.invoices.open)).toBeVisible(TIMEOUT_SHORT);
    await this.page.getByTestId(testIds.invoices.open).click();
  }
}
