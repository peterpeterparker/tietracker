import React, {CSSProperties, FormEvent, RefObject, useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';

import {useTranslation} from 'react-i18next';

import {rootConnector, RootProps} from '../../store/thunks/index.thunks';

import {Project, ProjectData} from '../../models/project';
import {ProjectsService} from '../../services/projects/projects.service';

import {
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
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

import {close} from 'ionicons/icons';

import {Settings} from '../../models/settings';

import {RootState} from '../../store/reducers';
import {Client} from '../../models/client';

export enum ProjectModalAction {
  CREATE,
  UPDATE,
}

interface Props extends RootProps {
  closeAction: Function;
  projectId: string | undefined;
  color: string | undefined;
  colorContrast: string;
  action: ProjectModalAction | undefined;
  client: Client | undefined;
}

const ProjectModal: React.FC<Props> = (props) => {
  const {t} = useTranslation(['projects', 'common', 'clients']);

  const settings: Settings = useSelector((state: RootState) => state.settings.settings);

  const [project, setProject] = useState<Project | undefined>(undefined);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [valid, setValid] = useState<boolean>(true);

  const [name, setName] = useState<string | undefined>(undefined);
  const [rate, setRate] = useState<number | undefined>(undefined);
  const [vat, setVat] = useState<boolean>(false);
  const [enabled, setEnabled] = useState<boolean>(true);
  const [budget, setBudget] = useState<number | undefined>(undefined);
  const [billed, setBilled] = useState<number | undefined>(undefined);

  const nameRef: RefObject<any> = useRef();
  const rateRef: RefObject<any> = useRef();
  const budgetRef: RefObject<any> = useRef();
  const billedRef: RefObject<any> = useRef();

  useEffect(() => {
    setLoading(true);

    loadProject();

    setLoading(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.action]);

  async function loadProject() {
    const project: Project | undefined = await ProjectsService.getInstance().find(props.projectId);

    setProject(project);

    setName(project && project.data !== undefined ? project.data.name : undefined);
    setRate(project && project.data !== undefined && project.data.rate !== undefined ? project.data.rate.hourly : undefined);
    setVat(project && project.data !== undefined && project.data.rate !== undefined ? project.data.rate.vat : false);
    setEnabled(project && project.data !== undefined ? !project.data.disabled : false);

    setBudget(project && project.data !== undefined && project.data.budget !== undefined ? project.data.budget.budget : undefined);
    setBilled(project && project.data !== undefined && project.data.budget !== undefined ? project.data.budget.billed : undefined);

    if (!project || project.data === undefined) {
      nameRef.current.value = undefined;
      rateRef.current.value = undefined;
      budgetRef.current.value = undefined;

      if (billedRef && billedRef.current) {
        billedRef.current.value = undefined;
      }
    }
  }

  function handleClientNameInput($event: CustomEvent<KeyboardEvent>) {
    setName(($event.target as InputTargetEvent).value);
  }

  function handleProjectRateInput($event: CustomEvent<KeyboardEvent>) {
    setRate(parseFloat(($event.target as InputTargetEvent).value));
  }

  function handleProjectBudgetInput($event: CustomEvent<KeyboardEvent>) {
    setBudget(parseFloat(($event.target as InputTargetEvent).value));
  }

  function handleProjectBilledInput($event: CustomEvent<KeyboardEvent>) {
    setBilled(parseFloat(($event.target as InputTargetEvent).value));
  }

  function onVatChange($event: CustomEvent) {
    setVat($event.detail.checked);
  }

  function onEnabledChange($event: CustomEvent) {
    setEnabled($event.detail.checked);
  }

  function validateProject() {
    setValid(name !== undefined && name.length >= 3 && rate !== undefined && rate >= 0);
  }

  async function handleSubmit($event: FormEvent<HTMLFormElement>) {
    $event.preventDefault();

    if (props.action === ProjectModalAction.UPDATE && (!project || !project.data)) {
      return;
    }

    if (props.action === undefined) {
      return;
    }

    setSaving(true);

    try {
      if (props.action === ProjectModalAction.UPDATE) {
        await updateProject();
      } else {
        await createProject();
      }

      props.closeAction(true);
    } catch (err) {
      // TODO show err
      console.error(err);
    }

    setSaving(false);
  }

  async function createProject() {
    if (!name || name === undefined || rate === undefined) {
      return;
    }

    const data: ProjectData = {
      name: name,
      disabled: false,
      rate: {
        hourly: rate,
        vat: vat,
      },
      budget: {
        budget: budget !== undefined && budget >= 0 ? budget : 0,
        billed: 0,
      },
    };

    await ProjectsService.getInstance().create(props.client, data);
  }

  async function updateProject() {
    let projectToUpdate: Project = {...(project as Project)};

    if (!projectToUpdate || projectToUpdate.data === undefined || projectToUpdate.data.rate === undefined) {
      return;
    }

    projectToUpdate.data.name = name as string;
    projectToUpdate.data.rate.hourly = rate as number;
    projectToUpdate.data.rate.vat = vat;
    projectToUpdate.data.disabled = !enabled;

    if (projectToUpdate.data.budget) {
      projectToUpdate.data.budget.budget = budget !== undefined && budget >= 0 ? budget : 0;
      projectToUpdate.data.budget.billed = billed !== undefined && billed >= 0 ? billed : 0;
    } else {
      projectToUpdate.data.budget = {
        budget: budget !== undefined && budget >= 0 ? budget : 0,
        billed: billed !== undefined && billed >= 0 ? billed : 0,
      };
    }

    await ProjectsService.getInstance().update(projectToUpdate);
  }

  return (
    <IonContent>
      <IonHeader>
        <IonToolbar style={{'--background': props.color, '--color': props.colorContrast} as CSSProperties}>
          <IonTitle>{name !== undefined ? name : ''}</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={() => props.closeAction()}>
              <IonIcon icon={close} slot="icon-only"></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <main className="ion-padding">{renderProject()}</main>
    </IonContent>
  );

  function renderProject() {
    if (loading) {
      return (
        <div className="spinner">
          <IonSpinner color="primary"></IonSpinner>
        </div>
      );
    }

    return (
      <form onSubmit={($event: FormEvent<HTMLFormElement>) => handleSubmit($event)}>
        <IonList className="inputs-list">
          <IonItem className="item-title">
            <IonLabel>{t('projects:project.title')}</IonLabel>
          </IonItem>
          <IonItem>
            <IonInput
              debounce={500}
              minlength={3}
              maxlength={32}
              ref={nameRef}
              required={true}
              input-mode="text"
              value={name}
              onIonInput={($event: CustomEvent<KeyboardEvent>) => handleClientNameInput($event)}
              onIonChange={() => validateProject()}></IonInput>
          </IonItem>

          <IonItem className="item-title">
            <IonLabel>{t('clients:create.hourly_rate')}</IonLabel>
          </IonItem>
          <IonItem>
            <IonInput
              debounce={500}
              minlength={1}
              required={true}
              ref={rateRef}
              input-mode="text"
              value={`${rate ? rate : ''}`}
              onIonInput={($event: CustomEvent<KeyboardEvent>) => handleProjectRateInput($event)}
              onIonChange={() => validateProject()}></IonInput>
          </IonItem>

          {renderBudget()}
          {renderBilled()}

          {renderVat()}

          {renderEnabled()}
        </IonList>

        <div className="actions">
          <IonButton
            type="submit"
            disabled={saving || !valid}
            aria-label={t('projects:project.update')}
            style={
              {
                '--background': props.color,
                '--color': props.colorContrast,
                '--background-hover': props.color,
                '--color-hover': props.colorContrast,
                '--background-activated': props.colorContrast,
                '--color-activated': props.color,
              } as CSSProperties
            }>
            <IonLabel>{props.action === ProjectModalAction.CREATE ? t('common:actions.create') : t('common:actions.update')}</IonLabel>
          </IonButton>

          <button type="button" disabled={saving} onClick={() => props.closeAction()}>
            {t('common:actions.cancel')}
          </button>
        </div>
      </form>
    );
  }

  function renderBudget() {
    return (
      <>
        <IonItem className="item-title">
          <IonLabel>{t('clients:create.budget')}</IonLabel>
        </IonItem>
        <IonItem>
          <IonInput
            debounce={500}
            minlength={1}
            ref={budgetRef}
            input-mode="text"
            value={`${budget ? budget : ''}`}
            onIonInput={($event: CustomEvent<KeyboardEvent>) => handleProjectBudgetInput($event)}></IonInput>
        </IonItem>
      </>
    );
  }

  function renderBilled() {
    if (props.action !== ProjectModalAction.UPDATE) {
      return undefined;
    }

    return (
      <>
        <IonItem className="item-title">
          <IonLabel>{t('projects:project.billed')}</IonLabel>
        </IonItem>
        <IonItem>
          <IonInput
            debounce={500}
            minlength={1}
            ref={billedRef}
            input-mode="text"
            value={`${billed ? billed : ''}`}
            onIonInput={($event: CustomEvent<KeyboardEvent>) => handleProjectBilledInput($event)}></IonInput>
        </IonItem>
      </>
    );
  }

  function renderVat() {
    if (!settings.vat || settings.vat === undefined) {
      return undefined;
    }

    return (
      <>
        <IonItem className="item-title">
          <IonLabel>{t('clients:create.vat')}</IonLabel>
        </IonItem>
        <IonItem className="item-checkbox">
          <IonLabel>{settings.vat}%</IonLabel>
          <IonCheckbox
            slot="end"
            style={{'--background-checked': props.color, '--border-color-checked': props.color} as CSSProperties}
            checked={vat}
            onIonChange={($event: CustomEvent) => onVatChange($event)}></IonCheckbox>
        </IonItem>
      </>
    );
  }

  function renderEnabled() {
    if (props.action !== ProjectModalAction.UPDATE) {
      return undefined;
    }

    return (
      <>
        <IonItem className="item-title">
          <IonLabel>{t('projects:project.status')}</IonLabel>
        </IonItem>
        <IonItem className="item-checkbox">
          <IonLabel>{enabled ? t('projects:project.ongoing') : t('projects:project.closed')}</IonLabel>
          <IonCheckbox
            slot="end"
            style={{'--background-checked': props.color, '--border-color-checked': props.color} as CSSProperties}
            checked={enabled}
            onIonChange={($event: CustomEvent) => onEnabledChange($event)}></IonCheckbox>
        </IonItem>
      </>
    );
  }
};

export default rootConnector(ProjectModal);
