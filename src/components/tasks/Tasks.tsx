import React, { CSSProperties } from 'react';
import { useSelector } from 'react-redux';

import { IonList, IonItem, IonLabel } from '@ionic/react';

import styles from './Tasks.module.scss';

import { TaskItem } from '../../store/interfaces/task.item';

import { rootConnector, RootProps } from '../../store/thunks/index.thunks';
import { RootState } from '../../store/reducers';

const Tasks: React.FC<RootProps> = (props: RootProps) => {

    const tasks: TaskItem[] | undefined = useSelector((state: RootState) => state.tasks.taskItems);

    return (
        <div className="ion-padding-end ion-padding-top">
            <h1 className={styles.title}>Today's completed tasks</h1>
            {renderTasks()}
        </div>
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

        return tasks.map((task: TaskItem) => {
            return <IonItem key={`task-${task.id}`} className={styles.item}>
                <div slot="start" style={{ 'background': task.data.client.color } as CSSProperties}></div>

                <IonLabel>
                    <h2>{task.data.client.name}</h2>
                    <h3>{task.data.project.name}</h3>
                    <p>{task.data.hours}h | {task.data.billable} CHF</p>
                </IonLabel>
            </IonItem>
        });
    }

}

export default rootConnector(Tasks);
