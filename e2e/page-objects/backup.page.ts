import {expect} from '@playwright/test';
import {join} from 'node:path';
import {testIds} from '../../src/lib/tests/test-ids.constants';
import {TIMEOUT_AVERAGE} from '../constants/e2e.constants';
import {compareZips, readZip} from '../utils/zip.test-utils';
import {AppPage} from './app.page';

export class BackupPage extends AppPage {
  readonly #DOWNLOAD_BACKUP_PATH = join(process.cwd(), 'tmp', 'backup.zip');

  async backup(): Promise<void> {
    await expect(this.page.getByTestId(testIds.backup.backup)).toBeVisible(TIMEOUT_AVERAGE);

    const downloadPromise = this.page.waitForEvent('download');
    await this.click(testIds.backup.backup);
    const download = await downloadPromise;

    await download.saveAs(this.#DOWNLOAD_BACKUP_PATH);
  }

  async assertBackupContent(): Promise<void> {
    const actual = await readZip({filePath: this.#DOWNLOAD_BACKUP_PATH});

    const fixturePath = join(process.cwd(), 'e2e', 'fixtures', 'backup.zip');
    const expected = await readZip({filePath: fixturePath});

    compareZips({actual, expected});
  }
}
