import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {
    IonItem,
    IonLabel,
    IonList, IonSelect, IonSelectOption,
    IonToggle, isPlatform,
} from '@ionic/react';

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

    const [minute, setMinute] = useState<number>(0);

    useEffect(() => {
        setMinute(props.settings.notifications ? props.settings.notifications.count : 0);
    }, [props.settings]);

    const darkTheme: boolean | undefined = useSelector((state: RootState) => {
        return state.theme.dark;
    });

    async function toggleTheme() {
        await props.switchTheme();
    }

    function onNotificationsTimeChange($event: CustomEvent) {
        if (!$event || !$event.detail) {
            return;
        }

        setMinute($event.detail.value);

        if (props.settings.notifications === undefined) {
            props.settings.notifications = {
                count: $event.detail.value,
                every: 'minute'
            };

            return;
        }

        props.settings.notifications.count = $event.detail.value;
    }

    return (
        <IonList className="inputs-list">
            <IonItem className="item-title">
                <IonLabel>Theme</IonLabel>
            </IonItem>

            <IonItem className="item-input item-radio with-padding">
                <IonLabel>{darkTheme ? t('general.mode.dark') : t('general.mode.light')} {darkTheme ? '🌑' : '☀️'}</IonLabel>
                <IonToggle slot="end" checked={darkTheme} mode="md" color="medium"
                           onClick={() => toggleTheme()}></IonToggle>
            </IonItem>

            {renderNotifications()}
        </IonList>
    );

    function renderNotifications() {
        if (!notifications) {
            return undefined;
        }

        return <>
            <IonItem className="item-title">
                <IonLabel>{t('general.notifications.title')}</IonLabel>
            </IonItem>

            <IonItem className="item-input">
                <IonSelect interfaceOptions={{header: t('general.notifications.title'), subHeader: t('general.notifications.body')}}
                           placeholder={t('general.notifications.title')}
                           value={minute}
                           onIonChange={($event: CustomEvent) => onNotificationsTimeChange($event)}>
                    <IonSelectOption value={0}>{t('general.notifications.minute.0')}</IonSelectOption>
                    <IonSelectOption value={30}>{t('general.notifications.minute.30')}</IonSelectOption>
                    <IonSelectOption value={60}>{t('general.notifications.minute.60')}</IonSelectOption>
                    <IonSelectOption value={120}>{t('general.notifications.minute.120')}</IonSelectOption>
                    <IonSelectOption value={240}>{t('general.notifications.minute.240')}</IonSelectOption>
                </IonSelect>
            </IonItem>
        </>
    }
};

export default SettingsGeneral;
