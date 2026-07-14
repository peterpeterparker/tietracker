import {type BrowserContext, expect} from '@playwright/test';
import {join} from 'node:path';
import type {Page} from 'playwright-core';
import {TestId} from '../../src/lib/tests/test-id';
import {testIds} from '../../src/lib/tests/test-ids.constants';
import {TIMEOUT_AVERAGE} from '../constants/e2e.constants';

export interface AppPageArgs {
  page: Page;
  context: BrowserContext;
}

export interface AppPageConstructor<T extends AppPage> {
  new (args: AppPageArgs): T;
}

export abstract class AppPage {
  readonly #page: Page;
  readonly #context: BrowserContext;

  constructor({page, context}: AppPageArgs) {
    this.#page = page;
    this.#context = context;
  }

  protected get page(): Page {
    return this.#page;
  }

  protected get context(): BrowserContext {
    return this.#context;
  }

  async goto(): Promise<void> {
    await this.#page.goto('/');
  }

  async open(testId: TestId): Promise<void> {
    await expect(this.#page.getByTestId(testId)).toBeVisible(TIMEOUT_AVERAGE);
    await this.#page.getByTestId(testId).click();
  }

  async restore(): Promise<void> {
    await this.open(testIds.nav.more);

    await this.open(testIds.more.openBackup);

    await this.#page
      .getByTestId(testIds.backup.restore)
      .setInputFiles(join(process.cwd(), 'e2e', 'fixtures', 'backup.zip'));

    await expect(this.#page.getByTestId(testIds.backup.restoreConfirm)).toBeVisible(TIMEOUT_AVERAGE);
    await this.#page.getByTestId(testIds.backup.restoreConfirm).click();
  }
}
