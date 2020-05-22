import React from 'react';
import {useSelector} from 'react-redux';

import {useTranslation} from 'react-i18next';

import {lightFormat} from 'date-fns';

import DateFnsUtils from '@date-io/date-fns';
import {DatePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';

import {IonList, IonButton} from '@ionic/react';

import styles from './Tasks.module.scss';

import {TaskItem as TaskItemStore} from '../../store/interfaces/task.item';

import {rootConnector, RootProps} from '../../store/thunks/index.thunks';
import {RootState} from '../../store/reducers';

import TaskItem from '../taskitem/TaskItem';
import {MaterialUiPickersDate} from '@material-ui/pickers/typings/date';

import {format} from '../../utils/utils.date';

import {Project} from '../../models/project';

interface Props extends RootProps {
  addAction: Function;
}

const Tasks: React.FC<Props> = (props: Props) => {
  const {t} = useTranslation('tasks');

  const tasks: TaskItemStore[] | undefined = useSelector((state: RootState) => state.tasks.taskItems);
  const selecteDay: Date = useSelector((state: RootState) => state.tasks.taskItemsSelectedDate);

  const projects: Project[] | undefined = useSelector((state: RootState) => state.activeProjects.projects);

  function openDatePicker() {
    const input: HTMLInputElement | null = document.querySelector('input.MuiInputBase-input');

    if (!input) {
      return;
    }

    input.click();
  }

  async function selectDate(day: Date) {
    await props.listTasks(day);
  }

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <div className="ion-padding-end ion-padding-top">
        <h1>{t('entries.title')}</h1>
        {renderTasksInfo()}

        {renderActions()}

        <IonList>{renderTasksItems()}</IonList>
      </div>
    </MuiPickersUtilsProvider>
  );

  function renderActions() {
    return (
      <div className={styles.action}>
        <IonButton onClick={() => openDatePicker()} fill="outline" color="medium" size="small" aria-label={t('entries.select_date')}>
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
      <IonButton onClick={() => props.addAction()} fill="outline" color="medium" size="small" aria-label={t('entries.add_task')}>
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
        <p className="placeholder" dangerouslySetInnerHTML={{__html: t(label, {selectedDate: format(selecteDay)})}}></p>

        <div className={styles.picker}>
          <DatePicker
            DialogProps={{disableEnforceFocus: true}}
            value={selecteDay}
            onChange={(date: MaterialUiPickersDate) => selectDate(date as Date)}
            format="yyyy/MM/dd"
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
