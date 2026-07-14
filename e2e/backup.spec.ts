import {test} from '@playwright/test';
import {testIds} from '../src/lib/tests/test-ids.constants';
import {BackupPage} from './page-objects/backup.page';
import {initTestSuite} from './utils/init.utils';

const getBackupPage = initTestSuite(BackupPage);

test('should backup data', async () => {
  const backupPage = getBackupPage();

  await backupPage.restore();

  await backupPage.open(testIds.nav.more);

  await backupPage.open(testIds.more.openBackup);

  await backupPage.backup();

  await backupPage.assertBackupContent();
});
