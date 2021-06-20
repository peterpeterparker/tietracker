import React, {useState} from 'react';

import {IonFab, IonFabButton, IonIcon, IonLabel, IonModal} from '@ionic/react';
import {serverOutline} from 'ionicons/icons';

import {useTranslation} from 'react-i18next';

import styles from '../Backup.module.scss';

import BackupModal from '../../../modals/backup/BackupModal';

export const BackupIdb = () => {
  const {t} = useTranslation('backup');

  const [showModal, setShowModal] = useState(false);

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <IonFab vertical="bottom" horizontal="end" slot="fixed" className={`${styles.backup}`}>
        <IonFabButton onClick={() => setShowModal(true)} color="button">
          <IonIcon icon={serverOutline} />
        </IonFabButton>

        <IonLabel>{t('backup_idb')}</IonLabel>
      </IonFab>

      <IonModal isOpen={showModal} onDidDismiss={closeModal}>
        <BackupModal closeAction={closeModal}></BackupModal>
      </IonModal>
    </>
  );
};
