import {expect} from '@playwright/test';
import {addMinutes, format} from 'date-fns';
import {testIds} from '../../src/lib/tests/test-ids.constants';
import {AppPage} from './app.page';

export class HomePage extends AppPage {
  async gotoHome(): Promise<void> {
    await this.open(testIds.nav.home);
  }

  async addManualInvoice(): Promise<void> {
    await this.open(testIds.tasks.openAddEntry);

    await this.click(testIds.tasks.openSelectProject);
    await this.page.getByRole('radio', {name: 'Acme - Website'}).click();
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

  async assertScreenshot(): Promise<void> {
    await expect(this.page).toHaveScreenshot({
      fullPage: true,
    });
  }
}
