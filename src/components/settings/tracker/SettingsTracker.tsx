import React, {useState} from 'react';
import {IonInput, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonModal} from '@ionic/react';

import {useTranslation} from 'react-i18next';

import styles from './SettingsTracker.module.scss';

import {Currency} from '../../../definitions/currency';

import {Settings} from '../../../models/settings';

import CurrenciesModal from '../../../modals/currencies/CurrenciesModal';

export interface SettingsGeneralProps {
  settings: Settings;
}

const SettingsTracker: React.FC<SettingsGeneralProps> = (props) => {
  const {t} = useTranslation('settings');

  const [showPopover, setShowPopover] = useState<boolean>(false);

  function onCurrencyChange(currency: Currency | undefined) {
    if (!currency) {
      setShowPopover(false);

      return;
    }

    props.settings.currency = currency;

    setShowPopover(false);
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

  function openPopover($event: any) {
    $event.preventDefault();

    setShowPopover(true);
  }

  return (
    <>
      <IonModal isOpen={showPopover} onDidDismiss={() => setShowPopover(false)}>
        <CurrenciesModal currency={props.settings.currency} closeAction={(currency?: Currency) => onCurrencyChange(currency)}></CurrenciesModal>
      </IonModal>

      <IonList className="inputs-list">
        <IonItem className="item-title">
          <IonLabel>{t('tracker.time.title')}</IonLabel>
        </IonItem>

        <IonItem className="item-input">
          <IonSelect
            interfaceOptions={{header: t('tracker.time.title')}}
            placeholder={t('tracker.time.title')}
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

        <IonItem className={styles.itemButton + ' item-input'}>
          <button aria-label={t('search.clients')} className={'input'} onClick={($event) => openPopover($event)}>
            <IonLabel>{props.settings.currency.currency}</IonLabel>
          </button>
        </IonItem>

        <IonItem className="item-title">
          <IonLabel>{t('tracker.vat.title')}</IonLabel>
        </IonItem>
        <IonItem>
          <IonInput
            debounce={500}
            input-mode="text"
            value={props.settings.vat ? `${props.settings.vat}` : ''}
            aria-label={t('tracker.vat.input')}
            onIonInput={($event: CustomEvent<KeyboardEvent>) => onVatInput($event)}></IonInput>
        </IonItem>
      </IonList>
    </>
  );
};

export default SettingsTracker;
