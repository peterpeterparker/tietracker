import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonToggle,
  IonToolbar,
  useIonAlert,
} from '@ionic/react';
import {chevronBackOutline} from 'ionicons/icons';
import React, {createRef, RefObject, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {useHistory} from 'react-router';
import Loading from '../../components/loading/Loading';
import {isIOS} from '../../lib/env';
import {BackupService} from '../../lib/services/backup.service';
import {ICloudService} from '../../lib/services/icloud.service';
import {RestoreService} from '../../lib/services/restore.service';
import {RootState} from '../../lib/store/reducers';
import {rootConnector, RootProps} from '../../lib/store/thunks/index.thunks';
import {testIds} from '../../lib/tests/test-ids.constants';
import {testId} from '../../lib/tests/test.utils';
import {Settings} from '../../lib/types/settings';
import {emitError} from '../../lib/utils/utils.events';
import {isNullish} from '../../lib/utils/utils.nullish';
import {initAllData} from '../../lib/utils/utils.store';
import styles from './Backup.module.scss';

enum BackupCategory {
  ICLOUD = 'icloud',
  MANUAL = 'manual',
}

const Backup: React.FC<RootProps> = (props) => {
  const {t} = useTranslation(['backup', 'common', 'icloud']);

  const [processing, setProcessing] = useState<boolean>(false);

  const inputRef: RefObject<HTMLInputElement | null> | undefined = createRef();

  const settings: Settings = useSelector((state: RootState) => state.settings.settings);

  const [category, setCategory] = useState<BackupCategory>(
    isIOS() ? BackupCategory.ICLOUD : BackupCategory.MANUAL,
  );

  const [present] = useIonAlert();

  const history = useHistory();

  const [iCloudSync, setICloudSync] = useState<boolean | undefined>(undefined);
  const [disableICloudSync, setDisableICloudSync] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    setICloudSync(props.settings.iOS?.iCloudSync !== false);
  }, [props.settings]);

  useEffect(() => {
    setDisableICloudSync(
      ([undefined, true].includes(props.settings.iOS?.iCloudSync) && iCloudSync) ||
        (props.settings.iOS?.iCloudSync === false && !iCloudSync),
    );
  }, [iCloudSync, props.settings]);

  async function doBackup() {
    try {
      await BackupService.getInstance().backup('idb', settings);
    } catch (err) {
      emitError(err);
    }
  }

  async function migrateICloudSync() {
    setProcessing(true);

    await ICloudService.create().migrate({
      currentSettings: settings,
      updateSettingsFn: props.updateSettings,
      done,
    });
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
          htmlAttributes: {
            ...testId(testIds.backup.restoreConfirm),
          },
          handler: async () => {
            setProcessing(true);

            await RestoreService.getInstance().restore({zip: file, settings, done});
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

  function selectCategory($event: CustomEvent) {
    if ($event && $event.detail) {
      setCategory($event.detail.value);
    }
  }

  function toggleICloudSync() {
    setICloudSync(!iCloudSync);
  }

  return (
    <IonPage>
      <IonContent>
        <main className="ion-padding">
          <IonHeader>
            <IonToolbar className="title">
              <IonButtons slot="start">
                <IonButton routerLink="/more" routerDirection="back">
                  <IonIcon icon={chevronBackOutline} slot="icon-only" />
                </IonButton>
              </IonButtons>
            </IonToolbar>
            {isIOS() && <IonToolbar className="title">{renderBackupCategory()}</IonToolbar>}
          </IonHeader>

          {renderContent()}
        </main>
      </IonContent>
    </IonPage>
  );

  function renderContent() {
    if (isNullish(settings)) {
      return (
        <div className="spinner">
          <IonSpinner color="primary"></IonSpinner>
        </div>
      );
    }

    if (category === BackupCategory.ICLOUD) {
      return renderICloudSync();
    }

    return renderManualBackup();
  }

  function renderManualBackup() {
    return (
      <>
        <p className={`${styles.text} ion-padding-top`}>{t('backup:text')}</p>

        <p>{t('backup:example')}</p>

        <div className={`actions ${styles.actions}`}>{renderManualActions()}</div>
      </>
    );
  }

  function renderIOSActions() {
    if (processing) {
      return <Loading></Loading>;
    }

    return (
      <>
        <IonButton
          type="button"
          color="button"
          onClick={migrateICloudSync}
          disabled={disableICloudSync}
          style={{marginTop: '8px'}}>
          <IonLabel>{t('icloud:migrate')}</IonLabel>
        </IonButton>
      </>
    );
  }

  function renderManualActions() {
    if (processing) {
      return <Loading></Loading>;
    }

    return (
      <>
        <IonButton
          type="button"
          color="button"
          onClick={doBackup}
          style={{marginTop: '8px'}}
          {...testId(testIds.backup.backup)}>
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
          {...testId(testIds.backup.restore)}
        />
      </>
    );
  }

  function renderBackupCategory() {
    if (!settings || settings === undefined) {
      return undefined;
    }

    return (
      <IonSegment
        mode="md"
        class="ion-padding-bottom"
        value={category}
        onIonChange={($event: CustomEvent) => selectCategory($event)}>
        <IonSegmentButton value={BackupCategory.ICLOUD} mode="md">
          <IonLabel>{t('backup:segments.icloud')}</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value={BackupCategory.MANUAL} mode="md">
          <IonLabel>{t('backup:segments.manual')}</IonLabel>
        </IonSegmentButton>
      </IonSegment>
    );
  }

  function renderICloudSync() {
    return (
      <>
        <p className={`${styles.text} ion-padding-top`}>{t('icloud:description')}</p>

        <IonItem className="item-title">
          <IonLabel>{t('icloud:title')}</IonLabel>
        </IonItem>

        <IonItem className="item-input item-radio with-padding">
          <IonLabel style={{flex: 1}}>
            <span>{iCloudSync !== false ? t('icloud:on') : t('icloud:off')}</span>
          </IonLabel>
          <IonToggle
            slot="end"
            checked={iCloudSync}
            mode="md"
            color="medium"
            onClick={() => toggleICloudSync()}></IonToggle>
        </IonItem>

        <div className={`actions ion-padding-top ${styles.actions}`}>{renderIOSActions()}</div>
      </>
    );
  }
};

export default rootConnector(Backup);
