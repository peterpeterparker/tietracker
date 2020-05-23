import React, {createRef, CSSProperties, FormEvent, RefObject, useEffect, useState} from 'react';
import {RouteComponentProps} from 'react-router';
import {useSelector} from 'react-redux';

import {useTranslation} from 'react-i18next';

import styles from './ClientDetails.module.scss';

import {rootConnector, RootProps} from '../../../store/thunks/index.thunks';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from '@ionic/react';

import {lockClosed, ellipsisHorizontal, ellipsisVertical, lockOpen, stopwatchOutline} from 'ionicons/icons';

import {formatCurrency} from '../../../utils/utils.currency';
import {contrast} from '../../../utils/utils.color';

import {Client} from '../../../models/client';
import {Settings} from '../../../models/settings';
import {Project} from '../../../models/project';

import {ClientsService} from '../../../services/clients/clients.service';
import {ProjectsService} from '../../../services/projects/projects.service';

import {RootState} from '../../../store/reducers';

import ProjectModal, {ProjectModalAction} from '../../../modals/project/ProjectModal';

import Budget from '../../../components/budget/Budget';

interface ClientDetailsProps
  extends RouteComponentProps<{
    id: string;
  }> {}

type Props = RootProps & ClientDetailsProps;

const ClientDetails: React.FC<Props> = (props: Props) => {
  const {t} = useTranslation(['projects', 'common', 'clients']);

  const clientColorRef: RefObject<any> = createRef();

  const [client, setClient] = useState<Client | undefined>(undefined);
  const [color, setColor] = useState<string | undefined>(undefined);

  const [projects, setProjects] = useState<Project[] | undefined>(undefined);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [valid, setValid] = useState<boolean>(true);

  const settings: Settings = useSelector((state: RootState) => state.settings.settings);

  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
  const [projectModalAction, setProjectModalAction] = useState<ProjectModalAction | undefined>(undefined);

  useIonViewWillEnter(async () => {
    setSaving(false);

    const client: Client | undefined = await ClientsService.getInstance().find(props.match.params.id);
    setClient(client);

    await loadProjects();

    setColor(client && client.data ? client.data.color : undefined);

    setLoading(false);
  });

  async function loadProjects() {
    const projects: Project[] | undefined = await ProjectsService.getInstance().listForClient(props.match.params.id);
    setProjects(projects);
  }

  useEffect(() => {
    if (clientColorRef && clientColorRef.current) {
      clientColorRef.current.addEventListener('colorChange', selectColor, false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientColorRef]);

  useIonViewWillLeave(() => {
    if (clientColorRef && clientColorRef.current) {
      clientColorRef.current.removeEventListener('colorChange', selectColor, true);
    }
  });

  function selectColor($event: CustomEvent) {
    if (client && client.data) {
      client.data.color = $event.detail.hex;

      setColor($event.detail.hex);
    }
  }

  function handleClientNameInput($event: CustomEvent<KeyboardEvent>) {
    if (client && client.data) {
      client.data.name = ($event.target as InputTargetEvent).value;
    }
  }

  function validateClientName() {
    setValid(client !== undefined && client.data !== undefined && client.data.name !== undefined && client.data.name.length >= 3);
  }

  async function handleSubmit($event: FormEvent<HTMLFormElement>) {
    $event.preventDefault();

    if (!client || !client.data) {
      return;
    }

    setSaving(true);

    try {
      await ClientsService.getInstance().update(client);

      await ProjectsService.getInstance().updateForClient(client);

      await updateStore();

      goBack();
    } catch (err) {
      // TODO show err
      console.error(err);
    }

    setSaving(false);
  }

  async function updateStore() {
    await props.initClients();
    await props.initActiveProjects();
    await props.listTasks(props.taskItemsSelectedDate);
    await props.listProjectsInvoices();
    await props.computeSummary();
  }

  async function closeProjectModal(refresh: boolean) {
    if (refresh) {
      await loadProjects();
      await updateStore();
    }

    setProjectModalAction(undefined);
    setSelectedProjectId(undefined);
  }

  function updateProject(projectId: string) {
    setSelectedProjectId(projectId);
    setProjectModalAction(ProjectModalAction.UPDATE);
  }

  function goBack() {
    props.history.push('/home');
  }

  return <IonPage>{renderContent()}</IonPage>;

  function renderContent() {
    const colorContrast: string = contrast(color);

    return (
      <>
        <IonContent>
          <IonHeader>
            <IonToolbar style={{'--background': color, '--color': colorContrast} as CSSProperties}>
              <IonButtons slot="start">
                <IonBackButton defaultHref="/home" style={{'--color': colorContrast} as CSSProperties} />
              </IonButtons>
              <IonTitle>{client && client.data ? client.data.name : ''}</IonTitle>
            </IonToolbar>
          </IonHeader>

          <main className="ion-padding">{renderClient(colorContrast)}</main>

          <IonModal isOpen={projectModalAction !== undefined} onDidDismiss={() => closeProjectModal(false)} cssClass="fullscreen">
            <ProjectModal
              action={projectModalAction}
              projectId={selectedProjectId}
              color={color}
              colorContrast={colorContrast}
              closeAction={closeProjectModal}
              client={client}></ProjectModal>
          </IonModal>
        </IonContent>
      </>
    );
  }

  function renderClient(colorContrast: string) {
    if (loading || !client || !client.data) {
      return (
        <div className="spinner">
          <IonSpinner color="primary"></IonSpinner>
        </div>
      );
    }

    return (
      <form onSubmit={($event: FormEvent<HTMLFormElement>) => handleSubmit($event)}>
        <IonList className={styles.clientList + ' inputs-list'}>
          <IonItem className="item-title">
            <IonLabel>{t('clients:details.client')}</IonLabel>
          </IonItem>
          <IonItem>
            <IonInput
              debounce={500}
              minlength={3}
              maxlength={32}
              required={true}
              input-mode="text"
              value={client.data.name}
              onIonInput={($event: CustomEvent<KeyboardEvent>) => handleClientNameInput($event)}
              onIonChange={() => validateClientName()}></IonInput>
          </IonItem>

          <IonItem className="item-title ion-margin-top">
            <IonLabel>{t('clients:create.color')}</IonLabel>
          </IonItem>

          <div className={styles.color}>
            <deckgo-color className="ion-padding-start ion-padding-end ion-padding-bottom" ref={clientColorRef} more={true} label={false} color-hex={`${client.data.color}`}>
              <IonIcon ios={ellipsisHorizontal} md={ellipsisVertical} slot="more" aria-label="More" class="more"></IonIcon>
            </deckgo-color>
          </div>
        </IonList>

        <IonList className={styles.projectListTitle + ' inputs-list'}>
          <IonItem className="item-title ion-no-margin">
            <IonLabel>{t('projects:projects.title')}</IonLabel>
          </IonItem>
        </IonList>

        <IonList className={styles.projectList + ' inputs-list'}>{renderProjects()}</IonList>

        <div className="actions">
          <IonButton
            type="submit"
            disabled={saving || !valid}
            aria-label={t('common:actions.update')}
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
            <IonLabel>{t('common:actions.update')}</IonLabel>
          </IonButton>

          <IonButton
            type="button"
            fill="outline"
            color="button"
            onClick={() => setProjectModalAction(ProjectModalAction.CREATE)}
            aria-label={t('clients:details.create_project')}
            aria-disabled={saving}>
            <IonLabel>{t('clients:details.create_project')}</IonLabel>
          </IonButton>

          <button type="button" onClick={goBack} disabled={saving}>
            {t('common:actions.cancel')}
          </button>
        </div>
      </form>
    );
  }

  function renderProjects() {
    if (!projects || projects.length <= 0) {
      return <p>{t('clients:details.empty')}</p>;
    }

    return projects.map((project: Project) => {
      return (
        <IonItem key={project.id} className={styles.projectItem + ' item-input'} onClick={() => updateProject(project.id)}>
          <div className={styles.summary}>
            <h2>{project.data.name}</h2>
            <IonLabel>
              <IonIcon icon={stopwatchOutline} aria-label={t('clients:details.hourly_rate')} />{' '}
              {formatCurrency(project.data.rate.hourly, settings.currency.currency)}/h
            </IonLabel>

            {project && project.data ? <Budget budget={project.data.budget}></Budget> : undefined}
          </div>
          <IonIcon slot="end" icon={project.data.disabled ? lockClosed : lockOpen} />
        </IonItem>
      );
    });
  }
};

export default rootConnector(ClientDetails);
