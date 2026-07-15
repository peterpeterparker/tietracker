import {test} from '@playwright/test';
import type {AppPage, AppPageConstructor} from '../page-objects/app.page';

export const initTestSuite = <T extends AppPage>(
  AppPageClass: AppPageConstructor<T>,
): (() => T) => {
  test.describe.configure({mode: 'serial'});

  let appPage: T;

  test.beforeAll(async ({playwright}) => {
    test.setTimeout(120000);

    const browser = await playwright.chromium.launch();

    const context = await browser.newContext();
    const page = await context.newPage();

    appPage = new AppPageClass({
      page,
      context,
    });

    await appPage.goto();

    // Try to reduce Ionic CI flakiness
    await page.waitForSelector('ion-app.hydrated');
  });

  return (): T => appPage;
};
