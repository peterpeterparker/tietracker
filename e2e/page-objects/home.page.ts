import {expect} from '@playwright/test';
import {addMinutes, format} from 'date-fns';
import {testIds} from '../../src/lib/tests/test-ids.constants';
import {AppPage} from './app.page';

export class HomePage extends AppPage {
  #NEW_CLIENT_NAME = 'Hello';
  #NEW_PROJECT_NAME = 'World';

  async gotoHome(): Promise<void> {
    await this.open(testIds.nav.home);
  }

  async createClient(): Promise<void> {
    await this.open(testIds.clients.openCreateClient);

    await expect(this.page.getByTestId(testIds.clients.clientName)).toBeVisible();
    await this.page
      .getByTestId(testIds.clients.clientName)
      .locator('input')
      .fill(this.#NEW_CLIENT_NAME);

    await this.page.getByTestId(testIds.clients.color).fill('#0db583');
    await this.page
      .getByTestId(testIds.clients.projectName)
      .locator('input')
      .fill(this.#NEW_PROJECT_NAME);
    await this.page.getByTestId(testIds.clients.rate).locator('input').fill('10');

    await this.click(testIds.clients.submit);
  }

  async addManualInvoice(): Promise<void> {
    await this.open(testIds.tasks.openAddEntry);

    await this.click(testIds.tasks.openSelectProject);
    await this.page
      .getByRole('radio', {name: `${this.#NEW_CLIENT_NAME} - ${this.#NEW_PROJECT_NAME}`})
      .click();
    await this.page.getByRole('button', {name: 'Ok'}).click();

    await this.click(testIds.tasks.openSelectDescription);
    await this.page.getByRole('radio', {name: 'Test'}).click();
    await this.page.getByRole('button', {name: 'Ok'}).click();

    const target = addMinutes(new Date(), 5);

    const toField = this.page.locator('[aria-label="To"]');
    await toField.getByRole('spinbutton', {name: 'Year'}).fill(format(target, 'yyyy'));
    await toField.getByRole('spinbutton', {name: 'Month'}).fill(format(target, 'MM'));
    await toField.getByRole('spinbutton', {name: 'Day'}).fill(format(target, 'dd'));
    await toField.getByRole('spinbutton', {name: 'Hours'}).fill(format(target, 'HH'));
    await toField.getByRole('spinbutton', {name: 'Minutes'}).fill(format(target, 'mm'));

    await this.click(testIds.tasks.submit);
  }

  async assertScreenshots(): Promise<void> {
    await this.assertSummaryScreenshot();

    await this.assertProjectsScreenshot();

    await this.assertTasksScreenshot();
  }

  async assertSummaryScreenshot(): Promise<void> {
    await expect(this.page.getByTestId(testIds.home.summary)).toBeVisible();
    await expect(this.page.getByTestId(testIds.home.summary)).toHaveScreenshot('home-summary.png');
  }

  async assertProjectsScreenshot(): Promise<void> {
    await expect(this.page.getByTestId(testIds.home.projects)).toBeVisible();
    await expect(this.page.getByTestId(testIds.home.projects)).toHaveScreenshot(
      'home-projects.png',
    );
  }

  async assertTasksScreenshot(): Promise<void> {
    await expect(this.page.getByTestId(testIds.home.tasks)).toBeVisible();
    await expect(this.page.getByTestId(testIds.home.tasks)).toHaveScreenshot('home-tasks.png');
  }
}
