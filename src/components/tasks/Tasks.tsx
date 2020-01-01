import React, {useState} from 'react';
import {useSelector} from 'react-redux';

import {lightFormat} from 'date-fns';

import styles from './Tasks.module.scss';

import {IonList, IonLabel} from '@ionic/react';

import {TaskItem as TaskItemStore} from '../../store/interfaces/task.item';

import {rootConnector} from '../../store/thunks/index.thunks';
import {RootState} from '../../store/reducers';

import TaskItem from '../taskitem/TaskItem';

const Tasks: React.FC = () => {

    const tasks: TaskItemStore[] | undefined = useSelector((state: RootState) => state.tasks.taskItems);

    const [tasksDay] = useState<string>(lightFormat(new Date(), 'yyyy-MM-dd'));

    return (
        <div className="ion-padding-end ion-padding-top">
            <h1>Today's Completed</h1>
            {renderTasks()}
        </div>
    );

    function renderTasks() {
        if (!tasks || tasks.length <= 0) {
            return <IonLabel className="placeholder">No tasks registered yet.</IonLabel>;
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
