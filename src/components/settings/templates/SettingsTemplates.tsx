import React, {useState} from 'react';

import {IonItem, IonLabel, IonReorderGroup, IonReorder, IonList, IonIcon, IonModal} from '@ionic/react';
import {ItemReorderEventDetail} from '@ionic/core';

import {addOutline, pencilOutline, repeatOutline} from 'ionicons/icons';

import {useTranslation} from 'react-i18next';

import styles from './SettingsTemplates.module.scss';

import {Settings} from '../../../models/settings';

import TemplateModal from '../../../modals/template/TemplateModal';

export interface SettingsDescriptionProps {
  settings: Settings;
}

const SettingsTemplates: React.FC<SettingsDescriptionProps> = (props) => {
  const {t} = useTranslation('settings');

  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const [reorder, setReorder] = useState<boolean>(false);

  function doReorder($event: CustomEvent<ItemReorderEventDetail>) {
    if (!$event || !$event.detail) {
      return;
    }

    if ($event.detail.from === $event.detail.to) {
      return;
    }

    if (props.settings.descriptions === undefined || props.settings.descriptions.length <= 0) {
      return;
    }

    const newDescriptions: string[] = [...props.settings.descriptions];

    newDescriptions.splice($event.detail.to, 0, ...newDescriptions.splice($event.detail.from, 1));

    props.settings.descriptions = [...newDescriptions];

    $event.detail.complete();
  }

  function toggleReorder($event: React.MouseEvent | React.TouchEvent) {
    $event.stopPropagation();

    setReorder(!reorder);
  }

  function openAddTemplate($event: React.MouseEvent | React.TouchEvent) {
    $event.stopPropagation();

    setShowTemplateModal(true);
  }

  async function addTemplate(template?: string) {
    if (!template || template === undefined || template === '') {
      return;
    }

    if (!props.settings || !props.settings.descriptions || props.settings.descriptions.length <= 0) {
      props.settings.descriptions = [];
    }

    props.settings.descriptions.push(template);
  }

  async function closeTemplateModal(template?: string) {
    setShowTemplateModal(false);

    await addTemplate(template);
  }

  return (
    <>
      <IonList className={`inputs-list ${styles.introduction}`}>
        <IonItem className="item-title">
          <IonLabel>{t('templates.title')}</IonLabel>
        </IonItem>
      </IonList>
      <IonReorderGroup disabled={!reorder} className="reorder-list ion-margin-bottom" onIonItemReorder={doReorder}>
        {renderDescriptions()}
      </IonReorderGroup>
      <div>
        <button
          type="button"
          onClick={($event: React.MouseEvent | React.TouchEvent) => openAddTemplate($event)}
          className={`${styles.templateAction} ion-margin-end`}>
          <IonIcon icon={addOutline} /> {t('templates.actions.add')}
        </button>
        <button type="button" onClick={($event: React.MouseEvent | React.TouchEvent) => toggleReorder($event)} className={styles.templateAction}>
          <IonIcon icon={repeatOutline} /> {t('templates.actions.reorder')}
        </button>
      </div>

      {renderAddTemplate()}
    </>
  );

  function renderDescriptions() {
    if (!props.settings || !props.settings.descriptions || props.settings.descriptions.length <= 0) {
      return [];
    }

    return props.settings.descriptions.map((description: string) => {
      return (
        <IonItem key={description} onClick={() => console.log('yo')}>
          <IonLabel>{description}</IonLabel>
          {reorder ? <IonReorder slot="end" /> : <IonIcon icon={pencilOutline} slot="end" />}
        </IonItem>
      );
    });
  }

  function renderAddTemplate() {
    return (
      <IonModal isOpen={showTemplateModal} onDidDismiss={async () => await closeTemplateModal()} cssClass="fullscreen">
        <TemplateModal closeAction={async (template?: string) => await closeTemplateModal(template)}></TemplateModal>
      </IonModal>
    );
  }
};

export default SettingsTemplates;
