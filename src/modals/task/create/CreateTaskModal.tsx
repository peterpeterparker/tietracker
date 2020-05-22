import React, {CSSProperties, FormEvent, useState} from 'react';
import {useSelector} from 'react-redux';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

import {DateTimePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import {useTranslation} from 'react-i18next';

import {close} from 'ionicons/icons';

import {contrast} from '../../../utils/utils.color';

import {rootConnector, RootProps} from '../../../store/thunks/index.thunks';
import {RootState} from '../../../store/reducers';

import {Project} from '../../../models/project';
import {Settings as SettingsModel} from '../../../models/settings';

import {pickerColor} from '../../../utils/utils.picker';

import {ThemeService} from '../../../services/theme/theme.service';
import {MaterialUiPickersDate} from '@material-ui/pickers/typings/date';
import {TaskData} from '../../../models/task';

interface Props extends RootProps {
  closeAction: Function;
}

const CreateTaskModal: React.FC<Props> = (props: Props) => {
  const {t} = useTranslation(['tasks', 'common']);

  const [project, setProject] = useState<Project | undefined>(undefined);
  const [description, setDescription] = useState<string | undefined>(undefined);
  const [from, setFrom] = useState<Date>(new Date());
  const [to, setTo] = useState<Date>(new Date());

  const projects: Project[] | undefined = useSelector((state: RootState) => state.activeProjects.projects);
  const settings: SettingsModel = useSelector((state: RootState) => state.settings.settings);

  async function handleSubmit($event: FormEvent<HTMLFormElement>) {
    $event.preventDefault();

    if (project === undefined || project.data === undefined || project.data.client === undefined || description === undefined) {
      return;
    }

    const now: number = new Date().getTime();

    const taskData: TaskData = {
      from: from.getTime(),
      to: to.getTime(),
      client_id: project.data.client.id,
      project_id: project.id,
      description: description,
      invoice: {
        status: 'open',
      },
      updated_at: now,
      created_at: now,
    };

    await props.createTask(taskData, 0);

    await props.computeSummary();
    await props.listTasks(props.taskItemsSelectedDate);
    await props.listProjectsInvoices();

    await props.closeAction();

    reset();
  }

  function reset() {
    setProject(undefined);
    setDescription(undefined);
  }

  function onProjectChange($event: CustomEvent) {
    if (!$event || !$event.detail) {
      return;
    }

    setProject($event.detail.value);
  }

  async function onDescriptionChange($event: CustomEvent) {
    if (!$event || !$event.detail) {
      return;
    }

    setDescription($event.detail.value);
  }

  return <MuiPickersUtilsProvider utils={DateFnsUtils}>{renderContent()}</MuiPickersUtilsProvider>;

  function renderContent() {
    const color: string | undefined = project && project.data && project.data.client ? project.data.client.color : undefined;
    const colorContrast: string = contrast(color, 128, ThemeService.getInstance().isDark());

    pickerColor(colorContrast, color);

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
            <IonTitle>{t('tasks:create.title')}</IonTitle>
            <IonButtons slot="start">
              <IonButton onClick={() => props.closeAction()}>
                <IonIcon icon={close} slot="icon-only"></IonIcon>
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <main className="ion-padding">{renderForm(color, colorContrast)}</main>
      </IonContent>
    );
  }

  function renderForm(color: string | undefined, colorContrast: string) {
    if (!projects || projects === undefined || projects.length <= 0) {
      return undefined;
    }

    const valid: boolean = project !== undefined && description !== undefined;

    return (
      <form onSubmit={($event: FormEvent<HTMLFormElement>) => handleSubmit($event)}>
        <IonList className="inputs-list">
          {renderProjects()}

          <IonItem className="item-title">
            <IonLabel>{t('tasks:tracker.description')}</IonLabel>
          </IonItem>

          <IonItem className="item-input">{renderTaskDescription()}</IonItem>

          {renderDates()}
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
    );
  }

  function renderProjects() {
    return (
      <>
        <IonItem className="item-title">
          <IonLabel>{t('tasks:create.project')}</IonLabel>
        </IonItem>

        <IonItem className="item-input">
          <IonSelect
            interfaceOptions={{header: t('tasks:create.project')}}
            placeholder={t('tasks:create.project')}
            value={project}
            onIonChange={($event: CustomEvent) => onProjectChange($event)}>
            {renderProjectOptions()}
          </IonSelect>
        </IonItem>
      </>
    );
  }

  function renderProjectOptions() {
    if (!projects || projects === undefined || projects.length <= 0) {
      return undefined;
    }

    return projects.map((project) => {
      let client: string = project.data && project.data.client ? `${project.data.client.name} - ` : '';

      return (
        <IonSelectOption value={project} key={project.id}>
          {client + project.data.name}
        </IonSelectOption>
      );
    });
  }

  function renderTaskDescription() {
    if (!settings || !settings.descriptions || settings.descriptions.length <= 0) {
      return undefined;
    }

    return (
      <IonSelect
        interfaceOptions={{header: t('tasks:tracker.description')}}
        placeholder={t('tasks:tracker.description')}
        value={description}
        onIonChange={($event: CustomEvent) => onDescriptionChange($event)}>
        {settings.descriptions.map((description: string, i: number) => {
          return (
            <IonSelectOption value={description} key={`desc-${i}`}>
              {description}
            </IonSelectOption>
          );
        })}
      </IonSelect>
    );
  }

  function renderDates() {
    return (
      <>
        <IonItem className="item-title">
          <IonLabel>{t('tasks:details.from')}</IonLabel>
        </IonItem>

        <IonItem className="item-input">
          <DateTimePicker
            value={from}
            onChange={(date: MaterialUiPickersDate) => setFrom(date as Date)}
            aria-label={t('tasks:details.from')}
            ampm={false}
            hideTabs={true}
            format="yyyy/MM/dd HH:mm"
          />
        </IonItem>

        <IonItem className="item-title">
          <IonLabel>{t('tasks:details.to')}</IonLabel>
        </IonItem>

        <IonItem className="item-input">
          <DateTimePicker
            value={to}
            onChange={(date: MaterialUiPickersDate) => setTo(date as Date)}
            aria-label={t('tasks:details.to')}
            ampm={false}
            hideTabs={true}
            format="yyyy/MM/dd HH:mm"
          />
        </IonItem>
      </>
    );
  }
};

export default rootConnector(CreateTaskModal);
