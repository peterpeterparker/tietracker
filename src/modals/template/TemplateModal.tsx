import React, {FormEvent, useEffect, useState} from 'react';

import {IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonTitle, IonToolbar} from '@ionic/react';

import {close} from 'ionicons/icons';

import {v4 as uuid} from 'uuid';

import {useTranslation} from 'react-i18next';

interface Props {
  closeAction: (template?: Template) => Promise<void>;
  template: Template | undefined;
}

const TemplateModal: React.FC<Props> = (props: Props) => {
  const {t} = useTranslation(['settings', 'common']);

  const [description, setDescription] = useState<string | undefined>(undefined);
  const [valid, setValid] = useState<boolean>(false);

  useEffect(() => {
    setDescription(props.template ? props.template.description : undefined);
  }, [props.template]);

  function handleTemplateInput($event: CustomEvent<KeyboardEvent>) {
    setDescription(($event.target as InputTargetEvent).value);
  }

  function validateTemplate() {
    setValid(description !== undefined && description.length >= 3);
  }

  async function handleSubmit($event: FormEvent<HTMLFormElement>) {
    $event.preventDefault();
    $event.stopPropagation();

    if (!valid) {
      return;
    }

    try {
      await props.closeAction({
        key: props.template ? props.template.key : uuid(),
        description: description as string,
      });
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
                  value={description}
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
