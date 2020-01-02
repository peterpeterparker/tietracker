import React, {useEffect, useState} from 'react';
import {
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonSelect,
    IonSelectOption
} from '@ionic/react';

import {useTranslation} from 'react-i18next';

import {Settings} from '../../../models/settings';
import {Currencies, SettingsService} from '../../../services/settings/settings.service';

export interface SettingsGeneralProps {
    settings: Settings;
}

const SettingsTracker: React.FC<SettingsGeneralProps> = (props) => {

    const {t} = useTranslation('settings');

    const [currencies, setCurrencies] = useState<Currencies | undefined>(undefined);

    useEffect(() => {
        initCurrencies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                <IonLabel>{t('tracker.time.title')}</IonLabel>
            </IonItem>

            <IonItem className="item-input">
                <IonSelect interfaceOptions={{header: t('tracker.time.title')}} placeholder={t('tracker.time.title')}
                           value={props.settings.roundTime}
                           onIonChange={($event: CustomEvent) => onRoundTimeChange($event)}>
                    <IonSelectOption value={1}>{t('tracker.time.minute.1')}</IonSelectOption>
                    <IonSelectOption value={5}>{t('tracker.time.minute.5')}</IonSelectOption>
                    <IonSelectOption value={15}>{t('tracker.time.minute.15')}</IonSelectOption>
                </IonSelect>
            </IonItem>

            <IonItem className="item-title">
                <IonLabel>{t('tracker.currency.title')}</IonLabel>
            </IonItem>

            <IonItem className="item-input">
                {renderCurrencies()}
            </IonItem>

            <IonItem className="item-title">
                <IonLabel>{t('tracker.vat.title')}</IonLabel>
            </IonItem>
            <IonItem>
                <IonInput debounce={500} input-mode="text" value={props.settings.vat ? `${props.settings.vat}` : ''} aria-label={t('tracker.vat.input')}
                          onIonInput={($event: CustomEvent<KeyboardEvent>) => onVatInput($event)}>
                </IonInput>
            </IonItem>
        </IonList>
    );

    function renderCurrencies() {
        if (!currencies || currencies === undefined) {
            return undefined;
        }

        return <IonSelect interfaceOptions={{header: t('tracker.currency.title')}} placeholder={t('tracker.currency.title')} value={props.settings.currency}
                          onIonChange={($event: CustomEvent) => onCurrencyChange($event)}>
            {
                Object.keys(currencies).map((key: string) => {
                    return <IonSelectOption value={key}
                                            key={`currency-${key}`}>{currencies[key].name} ({key})</IonSelectOption>
                })
            }
        </IonSelect>
    }

};

export default SettingsTracker;
