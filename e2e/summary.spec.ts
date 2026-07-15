import {test} from '@playwright/test';
import {HomePage} from './page-objects/home.page';
import {initTestSuite} from './utils/init.utils';

const getHomePage = initTestSuite(HomePage);

test('should compute summary', async () => {
  const homePage = getHomePage();

  await homePage.gotoHome();

  await homePage.createClient();

  await homePage.addManualInvoice();

  await homePage.waitForAnimation();

  await homePage.assertScreenshots();
});
