import React, {CSSProperties} from 'react';
import {useSelector} from 'react-redux';

import {IonItem, IonLabel} from '@ionic/react';

import styles from '../tasks/Tasks.module.scss';

import {TaskItem as TaskItemStore} from '../../store/interfaces/task.item';
import {rootConnector, RootProps} from '../../store/thunks/index.thunks';
import {RootState} from '../../store/reducers';

import {formatTime} from '../../utils/utils.time';
import {formatCurrency} from '../../utils/utils.currency';

import {Settings} from '../../models/settings';

interface TaskItemProps extends RootProps {
    task: TaskItemStore;
    tasksDay: string | undefined;
}

const TaskItem: React.FC<TaskItemProps> = (props) => {

    const settings: Settings = useSelector((state: RootState) => state.settings.settings);

    return (
        <IonItem className={styles.item} lines="none" detail={false}
                 routerLink={`/task/${props.tasksDay}/${props.task.id}`}>
            <div slot="start" style={{'background': props.task.data.client.color} as CSSProperties}></div>

            <IonLabel>
                <h2>{props.task.data.client.name}</h2>
                <h3>{props.task.data.project.name}</h3>
                <p>{formatTime(props.task.data.milliseconds)} - {formatCurrency(props.task.data.billable, settings.currency)}</p>
            </IonLabel>
        </IonItem>
    );
    
};

export default rootConnector(TaskItem);
