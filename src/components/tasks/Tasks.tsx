import React from 'react';
import {useSelector} from 'react-redux';

import {useTranslation} from 'react-i18next';

import {lightFormat} from 'date-fns';

import DateFnsUtils from '@date-io/date-fns';
import {DatePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';

import {IonList, IonIcon, IonItem} from '@ionic/react';

import {calendar} from 'ionicons/icons';

import styles from './Tasks.module.scss';

import {TaskItem as TaskItemStore} from '../../store/interfaces/task.item';

import {rootConnector, RootProps} from '../../store/thunks/index.thunks';
import {RootState} from '../../store/reducers';

import TaskItem from '../taskitem/TaskItem';
import {MaterialUiPickersDate} from '@material-ui/pickers/typings/date';

import {format} from '../../utils/utils.date';

const Tasks: React.FC<RootProps> = (props) => {

    const {t} = useTranslation('tasks');

    const tasks: TaskItemStore[] | undefined = useSelector((state: RootState) => state.tasks.taskItems);
    const selecteDay: Date = useSelector((state: RootState) => state.tasks.taskItemsSelectedDate);

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
                {renderTasks()}
            </div>
        </MuiPickersUtilsProvider>
    );

    function renderTasks() {
        if (!tasks || tasks.length <= 0) {
            return renderDatePicker('entries.empty');
        }

        return <>
            {renderDatePicker('entries.label')}
            <IonList>
                {renderTasksItems()}
            </IonList>
        </>
    }

    function renderDatePicker(label: string) {
        return <>
            <IonItem className={styles.action} onClick={() => openDatePicker()} lines="none" detail={false}>
                <IonIcon icon={calendar} slot="start"/>
                <p dangerouslySetInnerHTML={{__html: t(label, {selectedDate: format(selecteDay)})}}></p>
            </IonItem>

            <div className={styles.picker}>
                <DatePicker DialogProps={{disableEnforceFocus: true}} value={selecteDay}
                            onChange={(date: MaterialUiPickersDate) => selectDate(date as Date)}
                            format="yyyy/MM/dd"/>
            </div>
        </>
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
