import React from 'react';

import {useSelector} from 'react-redux';

import {IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonLabel, IonTitle, IonToolbar} from '@ionic/react';
import {close} from 'ionicons/icons';

import {useTranslation} from 'react-i18next';

import {BackupService} from '../../services/backup/backup.service';

import {RootState} from '../../store/reducers';
import {rootConnector, RootProps} from '../../store/thunks/index.thunks';

import {Settings} from '../../models/settings';

import styles from './BackupModal.module.scss';

interface Props extends RootProps {
  closeAction: () => void;
}

const BackupModal: React.FC<Props> = ({closeAction}) => {
  const {t} = useTranslation(['backup', 'common']);

  const settings: Settings = useSelector((state: RootState) => state.settings.settings);

  async function doBackup() {
    try {
      await BackupService.getInstance().backup('idb', settings);
    } catch (err) {
      // Error printed in the console
    }
  }

  return (
    <IonContent>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>{t('backup:backup_idb')}</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={() => closeAction()}>
              <IonIcon icon={close} slot="icon-only"></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <main className="ion-padding">
        <p>Back up the entire database and all its local data.</p>

        <div className={styles.center}>
          <IonButton type="button" color="primary" onClick={doBackup}>
            <IonLabel>{t('backup:backup')}</IonLabel>
          </IonButton>

          <button type="button" onClick={() => closeAction()}>
            {t('common:actions.cancel')}
          </button>
        </div>
      </main>
    </IonContent>
  );
};

export default rootConnector(BackupModal);
