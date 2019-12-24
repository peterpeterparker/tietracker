import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {lightFormat} from 'date-fns';

import {IonList, IonLabel} from '@ionic/react';

import styles from './Tasks.module.scss';

import {TaskItem as TaskItemStore} from '../../store/interfaces/task.item';

import {rootConnector} from '../../store/thunks/index.thunks';
import {RootState} from '../../store/reducers';

import TaskItem from '../taskitem/TaskItem';

const Tasks: React.FC = () => {

    const tasks: TaskItemStore[] | undefined = useSelector((state: RootState) => state.tasks.taskItems);

    const [tasksDay, setTasksDay] = useState<string>();

    useEffect(() => {
        if (tasks && tasks.length >= 1 && tasks[0].data !== undefined) {
            setTasksDay(lightFormat(new Date(tasks[0].data.from), 'yyyy-MM-dd'));
        } else {
            setTasksDay(lightFormat(new Date(), 'yyyy-MM-dd'));
        }
    }, [tasks]);

    return (
        <div className="ion-padding-end ion-padding-top">
            <h1 className={styles.title}>Today's completed</h1>
            {renderTasks()}
        </div>
    );

    function renderTasks() {
        if (!tasks || tasks.length <= 0) {
            return <IonLabel><p className={styles.title}>No tasks achieved yet.</p></IonLabel>;
        }

        return <IonList>
            {renderTasksItems()}
        </IonList>
    }

    function renderTasksItems() {
        if (!tasks || tasks.length <= 0) {
            return undefined;
        }

        return tasks.map((task: TaskItemStore) => {
            return <TaskItem task={task} tasksDay={tasksDay} key={`task-${task.id}`} ></TaskItem>;
        });
    }

};

export default rootConnector(Tasks);
