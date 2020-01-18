import React, {useEffect, useState} from 'react';

import {useTranslation} from 'react-i18next';

import {
    IonList,
    IonItem,
    IonToolbar,
    IonRadioGroup,
    IonLabel,
    IonRadio,
    IonSearchbar,
    IonContent,
    IonTitle,
    IonHeader, IonButtons, IonButton, IonIcon
} from '@ionic/react';

import {Currencies, SettingsService} from '../../services/settings/settings.service';

import styles from './CurrenciesModal.module.scss';

interface Props {
    closeAction: Function;
}

const CurrenciesModal: React.FC<Props> = (props: Props) => {

    const {t} = useTranslation('settings');

    const [currencies, setCurrencies] = useState<Currencies | undefined>(undefined);
    const [filteredCurrencies, setFilteredCurrencies] = useState<Currencies | undefined>(undefined);

    useEffect(() => {
        initCurrencies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setFilteredCurrencies(currencies);
    }, [currencies]);

    async function initCurrencies() {
        const currencies: Currencies | undefined = await SettingsService.getInstance().currencies();
        setCurrencies(currencies);
    }

    async function onFilter($event: CustomEvent<KeyboardEvent>) {
        if (!$event) {
            return;
        }

        const input: string = ($event.target as InputTargetEvent).value;

        if (!input || input === undefined || input === '') {
            setFilteredCurrencies(currencies);
        } else {
            const filtered: Currencies | undefined = await filterCurrencies(input);
            setFilteredCurrencies(filtered);
        }
    }

    function filterCurrencies(filter: string): Promise<Currencies | undefined> {
        return new Promise<Currencies | undefined>((resolve) => {
            if (!currencies) {
                resolve(undefined);
                return;
            }

            const results: Currencies = Object.keys(currencies)
                .filter((key: string) => {
                    return ((key.toLowerCase().indexOf(filter.toLowerCase()) > -1) ||
                        (currencies[key].name && currencies[key].name.toLowerCase().indexOf(filter.toLowerCase()) > -1));
                })
                .reduce((obj: Currencies, key: string) => {
                    obj[key] = currencies[key];
                    return obj;
                }, {});

            resolve(results);
        });
    }

    return (
        <>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>{t('tracker.currency.title')}</IonTitle>
                    <IonButtons slot="start">
                        <IonButton onClick={() => props.closeAction()}>
                            <IonIcon name="close" slot="icon-only"></IonIcon>
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <main className="ion-padding">
                    <IonSearchbar debounce={500} placeholder={t('tracker.currency.filter')}
                                  onIonInput={($event: CustomEvent<KeyboardEvent>) => onFilter($event)}></IonSearchbar>

                    <IonList>
                        <IonRadioGroup>
                            {renderCurrencies()}
                        </IonRadioGroup>
                    </IonList>
                </main>
            </IonContent>
        </>
    );

    function renderCurrencies() {
        if (!filteredCurrencies || filteredCurrencies === undefined) {
            return undefined;
        }

        return Object.keys(filteredCurrencies).map((key: string) => {
            return <IonItem key={`currency-${key}`} className={styles.item} onClick={() => props.closeAction(key)}>
                <IonLabel>{filteredCurrencies[key].name} ({key})</IonLabel>
                <IonRadio value="cord"/>
            </IonItem>
        })
    }

};

export default CurrenciesModal;
