import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {IonItem, IonLabel, IonList, IonToggle, isPlatform} from '@ionic/react';

import {useTranslation} from 'react-i18next';

import {RootState} from '../../../store/reducers';

import {Settings} from '../../../models/settings';

export interface SettingsGeneralProps {
  settings: Settings;
  switchTheme: Function;
}

const SettingsGeneral: React.FC<SettingsGeneralProps> = (props) => {
  const {t} = useTranslation('settings');

  const notifications: boolean = isPlatform('hybrid');

  const [notificationsOn, setNotificationsOn] = useState<boolean | undefined>(undefined);
  const [backup, setBackup] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    setNotificationsOn(props.settings.notifications !== undefined ? props.settings.notifications : false);
    setBackup(props.settings.backup !== undefined ? props.settings.backup : true);
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

  return (
    <IonList className="inputs-list">
      <IonItem className="item-title">
        <IonLabel>{t('general.theme')}</IonLabel>
      </IonItem>

      <IonItem className="item-input item-radio with-padding">
        <IonLabel>
          {darkTheme ? t('general.mode.dark') : t('general.mode.light')} {darkTheme ? '🌑' : '☀️'}
        </IonLabel>
        <IonToggle slot="end" checked={darkTheme} mode="md" color="medium" onClick={() => toggleTheme()}></IonToggle>
      </IonItem>

      {renderNotifications()}
      {renderBackup()}
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
          <IonLabel>{notificationsOn ? t('general.notifications.body') : t('general.notifications.dont')}</IonLabel>
          <IonToggle slot="end" checked={notificationsOn} mode="md" color="medium" onClick={() => toggleNotifications()}></IonToggle>
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
          <IonLabel>{backup ? t('general.backup.on') : t('general.backup.off')}</IonLabel>
          <IonToggle slot="end" checked={backup} mode="md" color="medium" onClick={() => toggleBackup()}></IonToggle>
        </IonItem>
      </>
    );
  }
};

export default SettingsGeneral;
