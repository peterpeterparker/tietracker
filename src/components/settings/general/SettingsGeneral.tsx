import type {IonInputCustomEvent} from '@ionic/core';
import {
  InputInputEventDetail,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonToggle,
  isPlatform,
} from '@ionic/react';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {isNotIOS} from '../../../lib/env';
import {RootState} from '../../../lib/store/reducers';
import {Settings} from '../../../lib/types/settings';
import {isNullish} from '../../../lib/utils/utils.nullish';

export interface SettingsGeneralProps {
  settings: Settings;
  switchTheme: Function;
}

const SettingsGeneral: React.FC<SettingsGeneralProps> = (props) => {
  const {t} = useTranslation('settings');

  const notifications: boolean = isPlatform('hybrid');

  const [notificationsOn, setNotificationsOn] = useState<boolean | undefined>(undefined);
  const [backup, setBackup] = useState<boolean | undefined>(undefined);
  const [iCloudSync, setICloudSync] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    setNotificationsOn(
      props.settings.notifications !== undefined ? props.settings.notifications : false,
    );
    setBackup(props.settings.backup !== undefined ? props.settings.backup : true);
    setICloudSync(props.settings.iOS?.iCloudSync !== false);
  }, [props.settings]);

  const darkTheme: boolean | undefined = useSelector((state: RootState) => {
    return state.theme.dark;
  });

  async function toggleTheme() {
    await props.switchTheme();
  }

  function toggleNotifications() {
    props.settings.notifications = !props.settings.notifications;
    setNotificationsOn(!notificationsOn);
  }

  function toggleBackup() {
    props.settings.backup = !props.settings.backup;
    setBackup(!backup);
  }

  function toggleICloudSync() {
    props.settings.iOS =
      isNullish(iCloudSync) || iCloudSync === true ? {iCloudSync: false} : undefined;
    setICloudSync(props.settings.iOS?.iCloudSync !== false);
  }

  function onSignatureInput($event: IonInputCustomEvent<InputInputEventDetail>) {
    if (!$event) {
      return;
    }

    const input: string = ($event.target as InputTargetEvent).value;
    props.settings.signature = input;
  }

  return (
    <IonList className="inputs-list">
      <IonItem className="item-title">
        <IonLabel>{t('general.theme')}</IonLabel>
      </IonItem>

      <IonItem className="item-input item-radio with-padding">
        <IonLabel style={{flex: 1}}>
          {darkTheme ? t('general.mode.dark') : t('general.mode.light')} {darkTheme ? '🌑' : '☀️'}
        </IonLabel>
        <IonToggle
          slot="end"
          checked={darkTheme}
          mode="md"
          color="medium"
          onClick={() => toggleTheme()}></IonToggle>
      </IonItem>

      {renderNotifications()}
      {renderBackup()}
      {renderICloudSync()}
      {renderSignature()}
    </IonList>
  );

  function renderNotifications() {
    if (!notifications) {
      return undefined;
    }

    return (
      <>
        <IonItem className="item-title">
          <IonLabel>{t('general.notifications.title')}</IonLabel>
        </IonItem>

        <IonItem className="item-input item-radio with-padding">
          <IonLabel style={{flex: 1}}>
            {notificationsOn ? t('general.notifications.body') : t('general.notifications.dont')}
          </IonLabel>
          <IonToggle
            slot="end"
            checked={notificationsOn}
            mode="md"
            color="medium"
            onClick={() => toggleNotifications()}></IonToggle>
        </IonItem>
      </>
    );
  }

  function renderICloudSync() {
    if (isNotIOS()) {
      return undefined;
    }

    return (
      <>
        <IonItem className="item-title">
          <IonLabel>{t('general.icloud.title')}</IonLabel>
        </IonItem>

        <IonItem className="item-input item-radio with-padding">
          <IonLabel style={{flex: 1}}>
            <span>{iCloudSync !== false ? t('general.icloud.on') : t('general.icloud.off')}</span>
          </IonLabel>
          <IonToggle
            slot="end"
            checked={iCloudSync}
            mode="md"
            color="medium"
            onClick={() => toggleICloudSync()}></IonToggle>
        </IonItem>
      </>
    );
  }

  function renderBackup() {
    return (
      <>
        <IonItem className="item-title">
          <IonLabel>{t('general.backup.title')}</IonLabel>
        </IonItem>

        <IonItem className="item-input item-radio with-padding">
          <IonLabel style={{flex: 1}}>
            <span>{backup ? t('general.backup.on') : t('general.backup.off')}</span>
          </IonLabel>
          <IonToggle
            slot="end"
            checked={backup}
            mode="md"
            color="medium"
            onClick={() => toggleBackup()}></IonToggle>
        </IonItem>
      </>
    );
  }

  function renderSignature() {
    return (
      <>
        <IonItem className="item-title">
          <IonLabel>{t('general.signature')}</IonLabel>
        </IonItem>
        <IonItem>
          <IonInput
            debounce={500}
            input-mode="text"
            value={props.settings.signature ? `${props.settings.signature}` : ''}
            aria-label={t('general.signature')}
            onIonInput={($event: IonInputCustomEvent<InputInputEventDetail>) =>
              onSignatureInput($event)
            }></IonInput>
        </IonItem>
      </>
    );
  }
};

export default SettingsGeneral;
