import {test} from '@playwright/test';
import {InvoicesPage} from './page-objects/invoices.page';
import {initTestSuite} from './utils/init.utils';

const getInvoicesPage = initTestSuite(InvoicesPage);

test('should export an invoice', async () => {
  const invoicesPage = getInvoicesPage();

  await invoicesPage.restore();

  await invoicesPage.gotoInvoices();

  await invoicesPage.exportInvoice();

  await invoicesPage.assertInvoiceContent();

  await invoicesPage.closeModal();
});

test('should export all invoices', async () => {
  const invoicesPage = getInvoicesPage();

  await invoicesPage.backupInvoices();

  await invoicesPage.assertInvoicesContent();
});
