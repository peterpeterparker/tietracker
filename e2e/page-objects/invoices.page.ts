import {testIds} from '../../src/lib/tests/test-ids.constants';
import {AppPage} from './app.page';

export class InvoicesPage extends AppPage {
  async gotoInvoices(): Promise<void> {
    await this.open(testIds.nav.invoices);
  }

  async export(): Promise<void> {
    await this.open(testIds.invoices.open);
  }
}
