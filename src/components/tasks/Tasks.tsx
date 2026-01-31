import React from 'react';
import {useSelector} from 'react-redux';

import {useTranslation} from 'react-i18next';

import {lightFormat} from 'date-fns';

import {LocalizationProvider, MobileDatePicker} from '@mui/x-date-pickers';

import {IonButton, IonList} from '@ionic/react';

import styles from './Tasks.module.scss';

import {TaskItem as TaskItemStore} from '../../store/interfaces/task.item';

import {RootState} from '../../store/reducers';
import {rootConnector, RootProps} from '../../store/thunks/index.thunks';

import TaskItem from '../taskitem/TaskItem';

import {format} from '../../utils/utils.date';

import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {Project} from '../../models/project';

interface Props extends RootProps {
  addAction: Function;
}

const Tasks: React.FC<Props> = (props: Props) => {
  const {t} = useTranslation('tasks');

  const tasks: TaskItemStore[] | undefined = useSelector(
    (state: RootState) => state.tasks.taskItems,
  );
  const selecteDay: Date = useSelector((state: RootState) => state.tasks.taskItemsSelectedDate);

  const projects: Project[] | undefined = useSelector(
    (state: RootState) => state.activeProjects.projects,
  );

  function openDatePicker() {
    const button = document.querySelector('.MuiInputAdornment-root button');

    if (!button) {
      return;
    }

    (button as HTMLButtonElement).click();
  }

  async function selectDate(day: Date | null) {
    if (day) {
      await props.listTasks(day);
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="ion-padding-end ion-padding-top">
        <h1>{t('entries.title')}</h1>
        {renderTasksInfo()}

        {renderActions()}

        <IonList>{renderTasksItems()}</IonList>
      </div>
    </LocalizationProvider>
  );

  function renderActions() {
    return (
      <div className={styles.action}>
        <IonButton
          onClick={() => openDatePicker()}
          fill="outline"
          color="medium"
          size="small"
          aria-label={t('entries.select_date')}>
          {t('entries.select_date')}
        </IonButton>

        {renderActionAdd()}
      </div>
    );
  }

  function renderActionAdd() {
    if (!projects || projects === undefined || projects.length <= 0) {
      return undefined;
    }

    return (
      <IonButton
        onClick={() => props.addAction()}
        fill="outline"
        color="medium"
        size="small"
        aria-label={t('entries.add_task')}>
        {t('entries.add_task')}
      </IonButton>
    );
  }

  function renderTasksInfo() {
    if (!tasks || tasks.length <= 0) {
      return renderDatePicker('entries.empty');
    }

    return renderDatePicker('entries.label');
  }

  function renderDatePicker(label: string) {
    return (
      <>
        <p
          className="placeholder"
          dangerouslySetInnerHTML={{__html: t(label, {selectedDate: format(selecteDay)})}}></p>

        <div className={styles.picker}>
          <MobileDatePicker
            value={selecteDay}
            onChange={selectDate}
            format="yyyy/MM/dd"
            slotProps={{
              dialog: {
                disableEnforceFocus: true,
              },
            }}
          />
        </div>
      </>
    );
  }

  function renderTasksItems() {
    if (!tasks || tasks.length <= 0) {
      return undefined;
    }

    const tasksDay: string = lightFormat(selecteDay, 'yyyy-MM-dd');

    return tasks.map((task: TaskItemStore) => {
      return <TaskItem task={task} tasksDay={tasksDay} key={`task-${task.id}`}></TaskItem>;
    });
  }
};

export default rootConnector(Tasks);
