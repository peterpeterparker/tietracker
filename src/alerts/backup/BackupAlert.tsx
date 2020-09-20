import React, {useEffect, useState} from 'react';

import {IonAlert, IonLoading} from '@ionic/react';

import {useTranslation} from 'react-i18next';

import {rootConnector} from '../../store/thunks/index.thunks';
import {RootState} from '../../store/reducers';

import {BackupService} from '../../services/backup/backup.service';
import {Settings} from '../../models/settings';
import {useSelector} from 'react-redux';

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

    await BackupService.getInstance().backup(settings);

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
