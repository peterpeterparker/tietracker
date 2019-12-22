import React, {FormEvent, useState} from 'react';
import {useSelector} from 'react-redux';

import {
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonPage,
    IonSpinner,
    IonTitle,
    IonToolbar, useIonViewWillEnter,
    IonSelect, IonSelectOption, IonButton
} from '@ionic/react';

import styles from './Settings.module.scss';

import {rootConnector, RootProps} from '../../store/thunks/index.thunks';
import {RootState} from '../../store/reducers';

import {Settings as SettingsModel} from '../../models/settings';
import {Currencies, SettingsService} from '../../services/settings/settings.service';

const Settings: React.FC<RootProps> = (props) => {

    const settings: SettingsModel = useSelector((state: RootState) => state.settings.settings);

    const [saving, setSaving] = useState<boolean>(false);

    const [currencies, setCurrencies] = useState<Currencies | undefined>(undefined);

    useIonViewWillEnter(async () => {
         const currencies: Currencies | undefined = await SettingsService.getInstance().currencies();
         setCurrencies(currencies);
    });

    async function handleSubmit($event: FormEvent<HTMLFormElement>) {
        $event.preventDefault();

        setSaving(true);

        try {
            await props.updateSettings(settings);
        } catch (err) {
            // TODO show err
            console.error(err);
        }

        setSaving(false);
    }

    function onCurrencyChange($event: CustomEvent) {
        if (!$event || !$event.detail) {
            return;
        }

        settings.currency = $event.detail.value;
    }

    function onRoundTimeChange($event: CustomEvent) {
        if (!$event || !$event.detail) {
            return;
        }

        settings.roundTime = $event.detail.value;
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>Settings</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {renderSettings()}
            </IonContent>
        </IonPage>
    );

    function renderSettings() {
        if (!settings || settings === undefined) {
            return <div className="spinner"><IonSpinner color="primary"></IonSpinner></div>;
        }

        return <form onSubmit={($event: FormEvent<HTMLFormElement>) => handleSubmit($event)}>
            <IonList className="inputs-list">
                <IonItem className="item-title">
                    <IonLabel>Currency</IonLabel>
                </IonItem>

                <IonItem className="item-input">
                    {renderCurrencies()}
                </IonItem>

                <IonItem className="item-title">
                    <IonLabel>Round time</IonLabel>
                </IonItem>

                <IonItem className="item-input">
                    <IonSelect placeholder="Round time" value={settings.roundTime} onIonChange={($event: CustomEvent) => onRoundTimeChange($event)}>
                        <IonSelectOption value={1}>1 minute</IonSelectOption>
                        <IonSelectOption value={5}>5 minutes</IonSelectOption>
                        <IonSelectOption value={15}>15 minutes</IonSelectOption>
                    </IonSelect>
                </IonItem>
            </IonList>

            <IonButton type="submit" disabled={saving} aria-label="Update task">
                <IonLabel>Save</IonLabel>
            </IonButton>
        </form>
    }

    function renderCurrencies() {
        if (!currencies || currencies === undefined) {
            return undefined;
        }

        return <IonSelect placeholder="Currency" value={settings.currency} onIonChange={($event: CustomEvent) => onCurrencyChange($event)}>
            {
                Object.keys(currencies).map((key: string) => {
                    return <IonSelectOption value={key} key={`currency-${key}`}>{currencies[key].name} ({key})</IonSelectOption>
                })
            }
        </IonSelect>
    }
};

export default rootConnector(Settings);
