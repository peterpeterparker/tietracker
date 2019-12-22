import React, {CSSProperties, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {lightFormat} from 'date-fns';

import {IonList, IonItem, IonLabel} from '@ionic/react';

import styles from './Tasks.module.scss';

import {TaskItem} from '../../store/interfaces/task.item';

import {rootConnector, RootProps} from '../../store/thunks/index.thunks';
import {RootState} from '../../store/reducers';

import {formatTime} from '../../utils/utils.time';
import {formatCurrency} from '../../utils/utils.currency';
import {Settings} from '../../models/settings';

const Tasks: React.FC<RootProps> = (props: RootProps) => {

    const tasks: TaskItem[] | undefined = useSelector((state: RootState) => state.tasks.taskItems);
    const settings: Settings = useSelector((state: RootState) => state.settings.settings);

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

        return tasks.map((task: TaskItem) => {
            return <IonItem key={`task-${task.id}`} className={styles.item} lines="none" detail={false}
                            routerLink={`/task/${tasksDay}/${task.id}`}>
                <div slot="start" style={{'background': task.data.client.color} as CSSProperties}></div>

                <IonLabel>
                    <h2>{task.data.client.name}</h2>
                    <h3>{task.data.project.name}</h3>
                    <p>{formatTime(task.data.milliseconds)} - {formatCurrency(task.data.billable, settings.currency)}</p>
                </IonLabel>
            </IonItem>
        });
    }

}

export default rootConnector(Tasks);
