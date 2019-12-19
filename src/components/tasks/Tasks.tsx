import React, { CSSProperties } from 'react';
import { useSelector } from 'react-redux';

import { IonList, IonItem, IonLabel } from '@ionic/react';

import styles from './Tasks.module.scss';

import { Task, TaskListData } from '../../models/task';

import { rootConnector, RootProps } from '../../store/thunks/index.thunks';
import { RootState } from '../../store/reducers';

const Tasks: React.FC<RootProps> = (props: RootProps) => {

    const tasks: Task[] | undefined = useSelector((state: RootState) => state.tasks.tasks);

    return (
        <>
            <h1>Today's completed tasks</h1>
            {renderTasks()}
        </>
    );

    function renderTasks() {
        return <IonList>
            {renderTasksItems()}
        </IonList>
    }

    function renderTasksItems() {
        if (!tasks || tasks.length <= 0) {
            return undefined;
        }

        return tasks.map((task: Task) => {
            const taskItemData: TaskListData = task.data as TaskListData;

            return <IonItem key={`task-${task.id}`} className={styles.item}>
                <div slot="start" style={{ 'background': taskItemData.client.color } as CSSProperties}></div>

                <IonLabel>
                    <h2>{taskItemData.client.name}</h2>
                    <h3>{taskItemData.project.name}</h3>
                    <p>{taskItemData.hours}h | {taskItemData.billable} CHF</p>
                </IonLabel>
            </IonItem>
        });
    }

}

export default rootConnector(Tasks);
