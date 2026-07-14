import {test} from '@playwright/test';
import {HomePage} from './page-objects/home.page';
import {initTestSuite} from './utils/init.utils';

const getHomePage = initTestSuite(HomePage);

test.only('should compute summary', async () => {
  const homePage = getHomePage();

  await homePage.restore(); // We need a client and project

  await homePage.gotoHome();

  await homePage.addManualInvoice();

  await homePage.assertScreenshot();
});
