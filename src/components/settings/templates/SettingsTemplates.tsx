import React, {useEffect, useState} from 'react';

import {IonItem, IonLabel, IonReorderGroup, IonReorder, IonList, IonIcon, IonModal} from '@ionic/react';
import {ItemReorderEventDetail} from '@ionic/core';

import {addOutline, pencilOutline, repeatOutline} from 'ionicons/icons';

import {v4 as uuid} from 'uuid';

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

  const [selectedTemplate, setSelectedTemplate] = useState<Template | undefined>(undefined);

  const initTemplates = (): Template[] => {
    if (props.settings && props.settings.descriptions && props.settings.descriptions.length > 0) {
      return props.settings.descriptions.map((description: string) => {
        return {
          key: uuid(),
          description,
        };
      });
    }

    return [];
  };

  const [templates, setTemplates] = useState<Template[]>(initTemplates());

  useEffect(() => {
    const descriptions: string[] = templates.map((template: Template) => template.description);

    if (JSON.stringify(descriptions) !== JSON.stringify(props.settings.descriptions)) {
      props.settings.descriptions = descriptions;
    }
  }, [templates]);

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

  function openAddTemplate($event: React.MouseEvent | React.TouchEvent, template: Template | undefined) {
    $event.stopPropagation();

    setSelectedTemplate(template);
    setShowTemplateModal(true);
  }

  async function addTemplate(template?: Template) {
    if (!template || template === undefined || template.description === '') {
      return;
    }

    const exist: boolean = templates.some((filteredTemplate: Template) => filteredTemplate.key === template.key);

    if (exist) {
      setTemplates(templates.map((filteredTemplate: Template) => (filteredTemplate.key === template.key ? template : filteredTemplate)));
    } else {
      setTemplates([...templates, template]);
    }
  }

  async function editTemplateModal(template?: Template) {
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
          onClick={($event: React.MouseEvent | React.TouchEvent) => openAddTemplate($event, undefined)}
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
    return templates.map((template: Template) => {
      return (
        <IonItem key={template.key} onClick={($event: React.MouseEvent | React.TouchEvent) => openAddTemplate($event, template)}>
          <IonLabel>{template.description}</IonLabel>
          {reorder ? <IonReorder slot="end" /> : <IonIcon icon={pencilOutline} slot="end" />}
        </IonItem>
      );
    });
  }

  function renderAddTemplate() {
    return (
      <IonModal isOpen={showTemplateModal} onDidDismiss={() => setShowTemplateModal(false)} cssClass="fullscreen">
        <TemplateModal template={selectedTemplate} closeAction={async (template?: Template) => await editTemplateModal(template)}></TemplateModal>
      </IonModal>
    );
  }
};

export default SettingsTemplates;
