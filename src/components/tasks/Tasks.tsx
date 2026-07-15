import {IonButton, IonList} from '@ionic/react';
import {LocalizationProvider, MobileDatePicker} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {lightFormat} from 'date-fns';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {TaskItem as TaskItemStore} from '../../lib/store/interfaces/task.item';
import {RootState} from '../../lib/store/reducers';
import {rootConnector, RootProps} from '../../lib/store/thunks/index.thunks';
import {testIds} from '../../lib/tests/test-ids.constants';
import {testId} from '../../lib/tests/test.utils';
import {Project} from '../../lib/types/project';
import {format} from '../../lib/utils/utils.date';
import TaskItem from '../taskitem/TaskItem';
import styles from './Tasks.module.scss';

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
      <div className="ion-padding-end ion-padding-top" {...testId(testIds.home.tasks)}>
        <h1>{t('entries.title')}</h1>

        {renderActions()}

        {renderTasksInfo()}

        <IonList className="ion-no-padding">{renderTasksItems()}</IonList>
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
        aria-label={t('entries.add_task')}
        {...testId(testIds.tasks.openAddEntry)}>
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
