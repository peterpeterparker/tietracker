import {IonIcon, IonSelect, IonSelectOption} from '@ionic/react';
import {checkmarkCircle} from 'ionicons/icons';
import React, {CSSProperties, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import Spinner from '../../../components/spinner/Spinner';
import TrackDetails from '../../../components/track-details/TrackDetails';
import {
  TaskInProgress,
  TaskInProgressClientData,
  TaskInProgressData,
} from '../../../lib/store/interfaces/task.inprogress';
import {RootState} from '../../../lib/store/reducers';
import {rootConnector, RootProps} from '../../../lib/store/thunks/index.thunks';
import {Settings as SettingsModel} from '../../../lib/types/settings';
import {contrast} from '../../../lib/utils/utils.color';
import styles from './TrackTaskModal.module.scss';

const TrackTaskModal: React.FC<RootProps> = (props: RootProps) => {
  const {t} = useTranslation('tasks');

  const [freeze, setFreeze] = useState<boolean>(false);

  const task: TaskInProgress | undefined = useSelector((state: RootState) => {
    return state.tasks.taskInProgress;
  });

  const client: TaskInProgressClientData | undefined = useSelector((state: RootState) => {
    return state.tasks.taskInProgress !== undefined && state.tasks.taskInProgress.data
      ? (state.tasks.taskInProgress.data as TaskInProgressData).client
      : undefined;
  });

  const contrastColor: string = useSelector((state: RootState) => {
    const client: TaskInProgressClientData | undefined =
      state.tasks.taskInProgress !== undefined && state.tasks.taskInProgress.data
        ? (state.tasks.taskInProgress.data as TaskInProgressData).client
        : undefined;
    return contrast(client !== undefined ? client.color : undefined);
  });

  const settings: SettingsModel = useSelector((state: RootState) => state.settings.settings);

  async function stopTask() {
    setFreeze(true);

    await props.stopTask(1500, settings.roundTime);

    await props.computeSummary();
    await props.listTasks(props.taskItemsSelectedDate);
    await props.listProjectsInvoices();

    setTimeout(() => {
      setFreeze(false);
    }, 1500);
  }

  async function onDescriptionChange($event: CustomEvent) {
    if (!$event || !$event.detail) {
      return;
    }

    if (!task || task.data === undefined) {
      return;
    }

    if ($event.detail.value === undefined || $event.detail.value === '') {
      delete task.data['description'];
    } else {
      task.data.description = $event.detail.value;
    }

    await props.updateTask(task);
  }

  return (
    <div
      className={`${styles.task} ${task !== undefined ? styles.progress : ''}`}
      style={client !== undefined ? {background: `${client.color}`} : undefined}>
      {client?.name && (
        <TrackDetails freeze={freeze} client={client} contrastColor={contrastColor} />
      )}

      <div style={{'--color': contrastColor} as CSSProperties} className={styles.section}>
        {task !== undefined ? (
          <Spinner
            freeze={freeze}
            color={client !== undefined ? client.color : undefined}
            contrast={contrastColor}></Spinner>
        ) : undefined}

        {renderTaskDescription()}

        <button
          onClick={() => stopTask()}
          aria-label={t('tracker.stop')}
          className="ion-activatable"
          disabled={freeze}>
          <IonIcon icon={checkmarkCircle} />
        </button>
      </div>
    </div>
  );

  function renderTaskDescription() {
    if (!settings || !settings.descriptions || settings.descriptions.length <= 0) {
      return undefined;
    }

    if (!task || task.data === undefined) {
      return undefined;
    }

    return (
      <IonSelect
        interfaceOptions={{header: t('tracker.description')}}
        placeholder={t('tracker.description')}
        value={task.data.description}
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
};

export default rootConnector(TrackTaskModal);
