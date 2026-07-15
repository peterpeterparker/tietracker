import {test} from '@playwright/test';
import {HomePage} from './page-objects/home.page';
import {initTestSuite} from './utils/init.utils';

const getHomePage = initTestSuite(HomePage);

test('should create client', async () => {
  const homePage = getHomePage();

  await homePage.gotoHome();

  await homePage.createClient();

  await homePage.waitForAnimation();

  await homePage.assertProjectsScreenshot();
});

test('should create another client', async () => {
  const homePage = getHomePage();

  await homePage.restore();

  await homePage.gotoHome();

  await homePage.createClient();

  await homePage.waitForAnimation();

  await homePage.assertProjectsScreenshot();
});
