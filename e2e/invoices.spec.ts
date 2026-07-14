import {test} from '@playwright/test';
import {InvoicesPage} from './page-objects/invoices.page';
import {initTestSuite} from './utils/init.utils';

const getInvoicesPage = initTestSuite(InvoicesPage);

test('restore', async () => {
  const invoicesPage = getInvoicesPage();

  await invoicesPage.gotoInvoices();

  await invoicesPage.export();
});
