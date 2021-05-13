import React, {useState} from 'react';

import {useSelector} from 'react-redux';

import {IonFab, IonFabButton, IonIcon, IonLabel, IonLoading} from '@ionic/react';
import {saveOutline} from 'ionicons/icons';

import {useTranslation} from 'react-i18next';

import styles from './Backup.module.scss';

import {Settings} from '../../models/settings';

import {BackupService} from '../../services/backup/backup.service';

import {RootState} from '../../store/reducers';

interface BackupProps {
  type: 'excel' | 'idb';
}

export const Backup = ({type}: BackupProps) => {
  const {t} = useTranslation('invoices');

  const [showLoading, setShowLoading] = useState(false);

  const settings: Settings = useSelector((state: RootState) => state.settings.settings);

  async function doBackup() {
    setShowLoading(true);

    try {
      await BackupService.getInstance().backup(type, settings);
    } catch (err) {
      // Error printed in the console
    }

    setShowLoading(false);
  }

  return (
    <>
      <IonFab vertical="bottom" horizontal="end" slot="fixed" className={`${styles.backup}`}>
        <IonFabButton onClick={() => doBackup()} color="button">
          <IonIcon icon={saveOutline} />
        </IonFabButton>

        <IonLabel>{type === 'idb' ? t('export.backup_idb') : t('export.backup_invoices')}</IonLabel>
      </IonFab>

      <IonLoading isOpen={showLoading} message={t('common:actions.wait')} />
    </>
  );
};
