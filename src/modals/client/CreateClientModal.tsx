import type {IonInputCustomEvent} from '@ionic/core';
import {
  InputInputEventDetail,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import React, {CSSProperties, FormEvent, RefObject, useEffect, useRef, useState} from 'react';

import {useSelector} from 'react-redux';

import {useTranslation} from 'react-i18next';

import {close} from 'ionicons/icons';

import styles from './CreateClientModal.module.scss';

import {Client, ClientData} from '../../models/client';
import {ProjectData} from '../../models/project';
import {rootConnector, RootProps} from '../../store/thunks/index.thunks';

import {contrast, PALETTE} from '../../utils/utils.color';

import {Settings} from '../../models/settings';
import {ThemeService} from '../../services/theme/theme.service';

import {RootState} from '../../store/reducers';
import {emitError} from '../../utils/utils.events';

interface Props extends RootProps {
  closeAction: Function;
}

const CreateClientModal: React.FC<Props> = (props: Props) => {
  const {t} = useTranslation(['clients', 'common']);

  const settings: Settings = useSelector((state: RootState) => state.settings.settings);

  const clientNameRef: RefObject<any> = useRef(undefined);
  const clientColorRef: RefObject<any> = useRef(undefined);
  const projectNameRef: RefObject<any> = useRef(undefined);
  const projectRateRef: RefObject<any> = useRef(undefined);
  const projectBudgetRef: RefObject<any> = useRef(undefined);

  const [projectData, setProjectData] = useState<ProjectData | undefined>(undefined);

  const [validClientColor, setValidClientColor] = useState<boolean>(false);
  const [validClientName, setValidClientName] = useState<boolean>(false);
  const [validProject, setValidProject] = useState<boolean>(false);

  // Access state in event listener trick: https://medium.com/geographit/accessing-react-state-in-event-listeners-with-usestate-and-useref-hooks-8cceee73c559
  const [clientData, _setClientData] = useState<ClientData | undefined>(undefined);
  const clientDataRef = useRef<ClientData | undefined>(clientData);
  const setClientData = (data: ClientData | undefined) => {
    clientDataRef.current = data;
    _setClientData(data);
  };

  useEffect(() => {
    const ref = clientColorRef.current;

    ref.addEventListener('colorChange', selectColor, false);

    return () => ref.removeEventListener('colorChange', selectColor, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setValidClientColor(clientData !== undefined && clientData.color !== undefined);
  }, [clientData]);

  useEffect(() => {
    if (!clientColorRef || !clientColorRef.current) {
      return;
    }

    clientColorRef.current.palette = PALETTE;
  }, [clientColorRef]);

  function handleClientNameInput($event: IonInputCustomEvent<InputInputEventDetail>) {
    let data: ClientData;

    if (clientData) {
      data = {...clientData};
      data.name = ($event.target as InputTargetEvent).value;
    } else {
      data = {
        name: ($event.target as InputTargetEvent).value,
      };
    }

    setClientData(data);
  }

  function validateClientName() {
    setValidClientName(
      clientData !== undefined && clientData.name !== undefined && clientData.name.length >= 3,
    );
  }

  const selectColor = ($event: CustomEvent) => {
    if (!clientDataRef.current) {
      return;
    }

    const data: ClientData = {...clientDataRef.current};
    data.color = $event.detail.hex;
    setClientData(data);
  };

  function handleProjectNameInput($event: IonInputCustomEvent<InputInputEventDetail>) {
    if (!clientData) {
      return;
    }

    let data: ProjectData;

    if (projectData) {
      data = {...projectData};
      data.name = ($event.target as InputTargetEvent).value;
    } else {
      data = {
        name: ($event.target as InputTargetEvent).value,
        disabled: false,
        rate: {
          hourly: 0,
          vat: settings.vat !== undefined,
        },
      };
    }

    setProjectData(data);
  }

  function handleProjectRateInput($event: IonInputCustomEvent<InputInputEventDetail>) {
    if (!clientData) {
      return;
    }

    let data: ProjectData;

    if (projectData) {
      data = {...projectData};
      data.rate.hourly = inputMinZero($event);
    } else {
      data = {
        name: '',
        disabled: false,
        rate: {
          hourly: inputMinZero($event),
          vat: settings.vat !== undefined,
        },
      };
    }

    setProjectData(data);
  }

  function handleProjectBudgetInput($event: IonInputCustomEvent<InputInputEventDetail>) {
    if (!clientData) {
      return;
    }

    let data;
    if (!projectData) {
      data = {
        name: '',
        disabled: false,
        rate: {
          hourly: 0,
          vat: settings.vat !== undefined,
        },
      };
    } else {
      data = {...projectData};
    }

    if (!data.budget) {
      data.budget = {
        budget: inputMinZero($event),
        billed: 0,
        type: 'project',
      };
    } else {
      data.budget.budget = inputMinZero($event);
    }

    setProjectData(data);
  }

  function handleProjectBudgetType($event: CustomEvent) {
    if (!clientData) {
      return;
    }

    let data: ProjectData;
    if (!projectData) {
      data = {
        name: '',
        disabled: false,
        rate: {
          hourly: 0,
          vat: settings.vat !== undefined,
        },
      };
    } else {
      data = {...projectData};
    }

    if (!data.budget) {
      data.budget = {
        budget: 0,
        billed: 0,
        type: $event.detail.value,
      };
    } else {
      data.budget.type = $event.detail.value;
    }

    setProjectData(data);
  }

  function inputMinZero($event: IonInputCustomEvent<InputInputEventDetail>): number {
    return ($event.target as InputTargetEvent).value
      ? parseFloat(($event.target as InputTargetEvent).value)
      : 0;
  }

  function validateProject() {
    setValidProject(
      projectData !== undefined &&
        projectData.name !== undefined &&
        projectData.name.length >= 3 &&
        projectData.rate &&
        projectData.rate.hourly >= 0,
    );
  }

  async function handleSubmit($event: FormEvent<HTMLFormElement>) {
    $event.preventDefault();

    if (clientData === undefined || projectData === undefined) {
      return;
    }

    try {
      const persistedClient: Client = await props.createClient(clientData);

      if (
        !persistedClient ||
        persistedClient === undefined ||
        !persistedClient.id ||
        persistedClient.id === undefined
      ) {
        // TODO: Error management
        // And what if client without project? duplicated? -> delete whatever function

        emitError('Client not created');
        return;
      }

      await props.createProject(persistedClient, projectData);

      await props.closeAction();

      await reset();
    } catch (err) {
      emitError(err);
    }
  }

  const reset = async () => {
    setClientData(undefined);
    setProjectData(undefined);

    if (clientNameRef && clientNameRef.current) {
      clientNameRef.current.value = undefined;
    }

    if (clientColorRef && clientColorRef.current) {
      clientColorRef.current.value = undefined;
    }

    if (projectNameRef && projectNameRef.current) {
      projectNameRef.current.value = undefined;
    }

    if (projectRateRef && projectRateRef.current) {
      projectRateRef.current.value = undefined;
    }

    if (projectBudgetRef && projectBudgetRef.current) {
      projectBudgetRef.current.value = undefined;
    }
  };

  function onVatChange($event: CustomEvent) {
    if (!$event || !$event.detail) {
      return;
    }

    if (!clientData) {
      return;
    }

    let data: ProjectData;

    if (projectData) {
      data = {...projectData};
      data.rate.vat = $event.detail.checked;
    } else {
      data = {
        name: '',
        disabled: false,
        rate: {
          hourly: 0,
          vat: $event.detail.checked,
        },
      };
    }

    setProjectData(data);
  }

  return renderContent();

  function renderContent() {
    const valid: boolean = validClientName && validProject && validClientColor;

    const color: string | undefined =
      clientData && clientData.color ? clientData.color : 'var(--ion-color-light)';
    const colorContrast: string = contrast(color, 128, ThemeService.getInstance().isDark());

    return (
      <IonContent>
        <IonHeader>
          <IonToolbar
            style={
              {
                '--background': color,
                '--color': colorContrast,
                '--ion-toolbar-color': colorContrast,
              } as CSSProperties
            }>
            <IonTitle>{t('clients:create.title')}</IonTitle>
            <IonButtons slot="start">
              <IonButton onClick={() => props.closeAction()}>
                <IonIcon icon={close} slot="icon-only"></IonIcon>
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <main className="ion-padding">
          <form onSubmit={($event: FormEvent<HTMLFormElement>) => handleSubmit($event)}>
            <IonList className="inputs-list">
              <IonItem className="item-title">
                <IonLabel>{t('clients:create.client')}</IonLabel>
              </IonItem>
              <IonItem>
                <IonInput
                  ref={clientNameRef}
                  debounce={500}
                  minlength={3}
                  maxlength={32}
                  required={true}
                  input-mode="text"
                  onIonInput={($event: IonInputCustomEvent<InputInputEventDetail>) =>
                    handleClientNameInput($event)
                  }
                  onIonChange={() => validateClientName()}></IonInput>
              </IonItem>

              <IonItem disabled={!validClientName} className="item-title ion-margin-top">
                <IonLabel>{t('clients:create.color')}</IonLabel>
              </IonItem>

              <div className={styles.color + ` ${!validClientName ? 'disabled' : ''}`}>
                {/* @ts-ignore */}
                <deckgo-color ref={clientColorRef} className="ion-padding-bottom">
                  {/* @ts-ignore */}
                </deckgo-color>
              </div>

              <IonItem disabled={!validClientName} className="item-title ion-margin-top">
                <IonLabel>{t('clients:create.project')}</IonLabel>
              </IonItem>
              <IonItem disabled={!validClientName}>
                <IonInput
                  ref={projectNameRef}
                  debounce={500}
                  minlength={3}
                  maxlength={32}
                  required={true}
                  input-mode="text"
                  onIonInput={($event: IonInputCustomEvent<InputInputEventDetail>) =>
                    handleProjectNameInput($event)
                  }
                  onIonChange={() => validateProject()}></IonInput>
              </IonItem>

              <IonItem disabled={!validClientName} className="item-title">
                <IonLabel>{t('clients:create.hourly_rate')}</IonLabel>
              </IonItem>
              <IonItem disabled={!validClientName}>
                <IonInput
                  ref={projectRateRef}
                  debounce={500}
                  minlength={1}
                  required={true}
                  input-mode="text"
                  onIonInput={($event: IonInputCustomEvent<InputInputEventDetail>) =>
                    handleProjectRateInput($event)
                  }
                  onIonChange={() => validateProject()}></IonInput>
              </IonItem>

              {renderBudget()}

              {renderVat(color)}
            </IonList>

            <div className="actions">
              <IonButton
                type="submit"
                disabled={!valid}
                style={
                  {
                    '--background': color,
                    '--color': colorContrast,
                    '--background-hover': color,
                    '--color-hover': colorContrast,
                    '--background-activated': colorContrast,
                    '--color-activated': color,
                  } as CSSProperties
                }>
                <IonLabel>{t('common:actions.submit')}</IonLabel>
              </IonButton>

              <button type="button" onClick={() => props.closeAction()}>
                {t('common:actions.cancel')}
              </button>
            </div>
          </form>
        </main>
      </IonContent>
    );
  }

  function renderVat(color: string | undefined) {
    if (!settings.vat || settings.vat === undefined) {
      return undefined;
    }

    return (
      <>
        <IonItem disabled={!validClientName} className="item-title">
          <IonLabel>{t('clients:create.vat')}</IonLabel>
        </IonItem>
        <IonItem disabled={!validClientName} className="item-checkbox">
          <IonLabel>{settings.vat}%</IonLabel>
          <IonCheckbox
            slot="end"
            style={
              {'--background-checked': color, '--border-color-checked': color} as CSSProperties
            }
            checked={projectData ? projectData.rate.vat : false}
            onIonChange={($event: CustomEvent) => onVatChange($event)}></IonCheckbox>
        </IonItem>
      </>
    );
  }

  function renderBudget() {
    return (
      <>
        <IonItem disabled={!validClientName} className="item-title">
          <IonLabel>{t('clients:budget.title')}</IonLabel>
        </IonItem>
        <div className="item-split">
          <IonItem disabled={!validClientName}>
            <IonInput
              ref={projectBudgetRef}
              debounce={500}
              minlength={1}
              input-mode="text"
              onIonInput={($event: IonInputCustomEvent<InputInputEventDetail>) =>
                handleProjectBudgetInput($event)
              }></IonInput>
          </IonItem>

          <IonItem className="item-input" disabled={!validClientName}>
            <IonSelect
              interfaceOptions={{header: t('clients:budget.type')}}
              placeholder=""
              onIonChange={($event: CustomEvent) => handleProjectBudgetType($event)}>
              <IonSelectOption value={'project'}>{t('clients:budget.project')}</IonSelectOption>
              <IonSelectOption value={'yearly'}>{t('clients:budget.yearly')}</IonSelectOption>
              <IonSelectOption value={'monthly'}>{t('clients:budget.monthly')}</IonSelectOption>
            </IonSelect>
          </IonItem>
        </div>
      </>
    );
  }
};

export default rootConnector(CreateClientModal);
