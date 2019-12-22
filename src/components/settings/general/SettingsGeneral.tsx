import React, {useEffect, useState} from 'react';

import {Settings} from '../../../models/settings';
import {
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonSelect, IonSelectOption,
} from '@ionic/react';
import {Currencies, SettingsService} from '../../../services/settings/settings.service';

export interface SettingsGeneralProps {
    settings: Settings;
}

const SettingsGeneral: React.FC<SettingsGeneralProps> = (props) => {

    const [currencies, setCurrencies] = useState<Currencies | undefined>(undefined);

    useEffect(() => {
        initCurrencies();
    }, []);

    async function initCurrencies() {
        const currencies: Currencies | undefined = await SettingsService.getInstance().currencies();
        setCurrencies(currencies);
    }

    function onCurrencyChange($event: CustomEvent) {
        if (!$event || !$event.detail) {
            return;
        }

        props.settings.currency = $event.detail.value;
    }

    function onRoundTimeChange($event: CustomEvent) {
        if (!$event || !$event.detail) {
            return;
        }

        props.settings.roundTime = $event.detail.value;
    }

    function onVatInput($event: CustomEvent<KeyboardEvent>) {
        if (!$event) {
            return;
        }

        const input: string = ($event.target as InputTargetEvent).value;

        if (!input || input === undefined || input === '') {
            delete props.settings['vat'];
        } else {
            props.settings.vat = parseFloat(($event.target as InputTargetEvent).value);
        }
    }

    return (
        <IonList className="inputs-list">
            <IonItem className="item-title">
                <IonLabel>Round time</IonLabel>
            </IonItem>

            <IonItem className="item-input">
                <IonSelect interfaceOptions={{header: 'Round time'}} placeholder="Round time" value={props.settings.roundTime} onIonChange={($event: CustomEvent) => onRoundTimeChange($event)}>
                    <IonSelectOption value={1}>1 minute</IonSelectOption>
                    <IonSelectOption value={5}>5 minutes</IonSelectOption>
                    <IonSelectOption value={15}>15 minutes</IonSelectOption>
                </IonSelect>
            </IonItem>

            <IonItem className="item-title">
                <IonLabel>Currency</IonLabel>
            </IonItem>

            <IonItem className="item-input">
                {renderCurrencies()}
            </IonItem>

            <IonItem className="item-title">
                <IonLabel>Vat</IonLabel>
            </IonItem>
            <IonItem>
                <IonInput debounce={500} input-mode="text" value={props.settings.vat ? `${props.settings.vat}` : ''}
                          onIonInput={($event: CustomEvent<KeyboardEvent>) => onVatInput($event)}>
                </IonInput>
            </IonItem>
        </IonList>
    );

    function renderCurrencies() {
        if (!currencies || currencies === undefined) {
            return undefined;
        }

        return <IonSelect placeholder="Currency" value={props.settings.currency} onIonChange={($event: CustomEvent) => onCurrencyChange($event)}>
            {
                Object.keys(currencies).map((key: string) => {
                    return <IonSelectOption value={key} key={`currency-${key}`}>{currencies[key].name} ({key})</IonSelectOption>
                })
            }
        </IonSelect>
    }

};

export default SettingsGeneral;
