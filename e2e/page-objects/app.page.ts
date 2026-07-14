import {type BrowserContext, expect} from '@playwright/test';
import type {Page} from 'playwright-core';
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

  async gotoMore(): Promise<void> {
    await expect(this.#page.getByTestId(testIds.nav.more)).toBeVisible(TIMEOUT_AVERAGE);
    await this.#page.getByTestId(testIds.nav.more).click();
  }

  async restore(): Promise<void> {
    await this.gotoMore();


  }
}
