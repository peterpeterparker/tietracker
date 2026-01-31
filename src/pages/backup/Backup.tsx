import React, {createRef, RefObject, useState} from 'react';

import {useHistory} from 'react-router';

import {useSelector} from 'react-redux';

import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonLabel,
  IonPage,
  IonToolbar,
  useIonAlert,
} from '@ionic/react';

import {useTranslation} from 'react-i18next';

import {BackupService} from '../../services/backup/backup.service';

import {RootState} from '../../store/reducers';
import {rootConnector, RootProps} from '../../store/thunks/index.thunks';

import Loading from '../../components/loading/Loading';
import {Settings} from '../../models/settings';

import styles from './Backup.module.scss';

import {RestoreService} from '../../services/restore/restore.service';

import {emitError} from '../../utils/utils.events';
import {initAllData} from '../../utils/utils.store';

const Backup: React.FC<RootProps> = (props) => {
  const {t} = useTranslation(['backup', 'common']);

  const [processing, setProcessing] = useState<boolean>(false);

  const inputRef: RefObject<HTMLInputElement | null> | undefined = createRef();

  const settings: Settings = useSelector((state: RootState) => state.settings.settings);

  const [present] = useIonAlert();

  const history = useHistory();

  async function doBackup() {
    try {
      await BackupService.getInstance().backup('idb', settings);
    } catch (err) {
      emitError(err);
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

    history.push('/');
  };

  function openFileDialog() {
    if (!inputRef || !inputRef.current) {
      return;
    }

    inputRef.current.click();
  }

  return (
    <IonPage>
      <IonContent>
        <main className="ion-padding">
          <IonHeader>
            <IonToolbar className="title">
              <IonButtons slot="start">
                <IonBackButton defaultHref="/more" />
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <p className={`${styles.text} ion-padding-top`}>{t('backup:text')}</p>

          <p>{t('backup:example')}</p>

          <div className={`actions ${styles.actions}`}>{renderActions()}</div>
        </main>
      </IonContent>
    </IonPage>
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

        <input
          type="file"
          accept="application/zip"
          ref={inputRef}
          onChange={() => onInputChange()}
          className={styles.input}
        />
      </>
    );
  }
};

export default rootConnector(Backup);
