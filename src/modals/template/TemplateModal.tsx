import React, {FormEvent, useState} from 'react';

import {IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonTitle, IonToolbar} from '@ionic/react';

import {close} from 'ionicons/icons';

import {useTranslation} from 'react-i18next';

interface Props {
  closeAction: (template?: string) => Promise<void>;
}

const TemplateModal: React.FC<Props> = (props: Props) => {
  const {t} = useTranslation(['settings', 'common']);

  const [template, setTemplate] = useState<string | undefined>(undefined);
  const [valid, setValid] = useState<boolean>(false);

  function handleTemplateInput($event: CustomEvent<KeyboardEvent>) {
    setTemplate(($event.target as InputTargetEvent).value);
  }

  function validateTemplate() {
    setValid(template !== undefined && template.length >= 3);
  }

  async function handleSubmit($event: FormEvent<HTMLFormElement>) {
    $event.preventDefault();
    $event.stopPropagation();

    if (!valid) {
      return;
    }

    try {
      await props.closeAction(template);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>{t('settings:templates.edit.title')}</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={() => props.closeAction()}>
              <IonIcon icon={close} slot="icon-only"></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <main className="ion-padding">
          <form onSubmit={($event: FormEvent<HTMLFormElement>) => handleSubmit($event)}>
            <IonList className="inputs-list">
              <IonItem className="item-title">
                <IonLabel>{t('settings:templates.title')}</IonLabel>
              </IonItem>
              <IonItem>
                <IonInput
                  debounce={500}
                  minlength={3}
                  maxlength={32}
                  required={true}
                  input-mode="text"
                  onIonInput={($event: CustomEvent<KeyboardEvent>) => handleTemplateInput($event)}
                  onIonChange={() => validateTemplate()}></IonInput>
              </IonItem>
            </IonList>

            <div className="actions">
              <IonButton type="submit" disabled={!valid}>
                <IonLabel>{t('common:actions.submit')}</IonLabel>
              </IonButton>

              <button type="button" onClick={() => props.closeAction()}>
                {t('common:actions.cancel')}
              </button>
            </div>
          </form>
        </main>
      </IonContent>
    </>
  );
};

export default TemplateModal;
