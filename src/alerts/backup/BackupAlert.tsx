import React, {useEffect, useState} from 'react';

import {IonAlert, IonLoading} from '@ionic/react';

import {useTranslation} from 'react-i18next';

import {RootState} from '../../store/reducers';
import {rootConnector} from '../../store/thunks/index.thunks';

import {useSelector} from 'react-redux';
import {Settings} from '../../models/settings';
import {BackupService} from '../../services/backup/backup.service';

const BackupAlert: React.FC = () => {
  const {t} = useTranslation(['backup', 'common']);

  const settings: Settings = useSelector((state: RootState) => state.settings.settings);

  const [showAlertBackup, setShowAlertBackup] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    initBackup();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  async function initBackup() {
    const needBackup = await BackupService.getInstance().needBackup();
    setShowAlertBackup(needBackup && settings.backup === true);
  }

  async function cancel() {
    await BackupService.getInstance().setBackup();
  }

  async function doExport() {
    setShowLoading(true);

    try {
      await BackupService.getInstance().backup('excel', settings);
    } catch (err) {
      // Error printed in the console
    }

    setShowLoading(false);
  }

  return (
    <>
      <IonAlert
        isOpen={showAlertBackup}
        onDidDismiss={() => setShowAlertBackup(false)}
        header={t('backup:title')}
        message={t('backup:message')}
        buttons={[
          {
            text: t('common:actions.cancel'),
            role: 'cancel',
            handler: async () => {
              await cancel();
            },
          },
          {
            text: t('common:actions.export'),
            handler: async () => {
              await doExport();
            },
          },
        ]}
      />

      <IonLoading isOpen={showLoading} message={t('common:actions.wait')} />
    </>
  );
};

export default rootConnector(BackupAlert);
