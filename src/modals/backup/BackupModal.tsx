import React, {createRef, RefObject, useState} from 'react';

import {useSelector} from 'react-redux';

import {IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonLabel, IonTitle, IonToolbar, useIonAlert} from '@ionic/react';
import {close} from 'ionicons/icons';

import {useTranslation} from 'react-i18next';

import {BackupService} from '../../services/backup/backup.service';

import {RootState} from '../../store/reducers';
import {rootConnector, RootProps} from '../../store/thunks/index.thunks';

import {Settings} from '../../models/settings';
import Loading from '../../components/loading/Loading';

import styles from './BackupModal.module.scss';

import {RestoreService} from '../../services/restore/restore.service';

import {initAllData} from '../../utils/utils.store';

interface Props extends RootProps {
  closeAction: () => void;
}

const BackupModal: React.FC<Props> = (props) => {
  const {closeAction} = props;

  const {t} = useTranslation(['backup', 'common']);

  const [processing, setProcessing] = useState<boolean>(false);

  const inputRef: RefObject<HTMLInputElement> = createRef();

  const settings: Settings = useSelector((state: RootState) => state.settings.settings);

  const [present] = useIonAlert();

  async function doBackup() {
    try {
      await BackupService.getInstance().backup('idb', settings);
    } catch (err) {
      // Error printed in the console
    }
  }

  async function onInputChange() {
    if (!inputRef || !inputRef.current) {
      return;
    }

    const file: File | undefined | null = inputRef.current.files?.[0];

    present({
      header: t('backup:alert.warning'),
      message: t('backup:alert.sure'),
      buttons: [
        t('common:actions.cancel'),
        {
          text: t('common:actions.ok'),
          handler: async () => {
            setProcessing(true);

            await RestoreService.getInstance().restore({zip: file, done});
          },
        },
      ],
    });
  }

  const done = async (success: boolean) => {
    setProcessing(false);

    if (!success) {
      return;
    }

    await props.initTheme();

    await initAllData(props);

    closeAction();
  };

  function openFileDialog() {
    if (!inputRef || !inputRef.current) {
      return;
    }

    inputRef.current.click();
  }

  return (
    <IonContent>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('backup:backup_idb')}</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={() => closeAction()}>
              <IonIcon icon={close} slot="icon-only"></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <main className="ion-padding">
        <p className={styles.text}>{t('backup:text')}</p>

        <p>{t('backup:example')}</p>

        <div className={`actions ${styles.actions}`}>{renderActions()}</div>
      </main>
    </IonContent>
  );

  function renderActions() {
    if (processing) {
      return <Loading></Loading>;
    }

    return (
      <>
        <IonButton type="button" color="button" onClick={doBackup} style={{marginTop: '8px'}}>
          <IonLabel>{t('backup:backup')}</IonLabel>
        </IonButton>

        <IonButton type="button" color="danger" onClick={openFileDialog}>
          <IonLabel>{t('backup:restore')}</IonLabel>
        </IonButton>

        <input type="file" accept="application/zip" ref={inputRef} onChange={() => onInputChange()} className={styles.input} />

        <button type="button" onClick={() => closeAction()}>
          {t('common:actions.cancel')}
        </button>
      </>
    );
  }
};

export default rootConnector(BackupModal);
