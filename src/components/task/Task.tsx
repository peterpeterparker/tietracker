import React, { useState, CSSProperties } from 'react';
import { useSelector } from 'react-redux';

import { IonIcon, IonLabel } from '@ionic/react';

import styles from './Task.module.scss';

import { checkmarkCircle } from 'ionicons/icons';

import { RootState } from '../../store/reducers';
import { rootConnector, RootProps } from '../../store/thunks/index.thunks';

import { Task as TaskModel, TaskInProgressClientData, TaskInProgressData } from '../../models/task';

import Spinner from '../spinner/Spinner';
import { contrast } from '../../utils/utils.color';

const Task: React.FC<RootProps> = (props: RootProps) => {

    const [freeze, setFreeze] = useState<boolean>(false);

    const task: TaskModel | undefined = useSelector((state: RootState) => {
        return state.tasks.task;
    });

    const client: TaskInProgressClientData | undefined = useSelector((state: RootState) => {
        return state.tasks.task !== undefined && state.tasks.task.data ? (state.tasks.task.data as TaskInProgressData).client : undefined
    });

    const contrastColor: string = useSelector((state: RootState) => {
        const client: TaskInProgressClientData | undefined = state.tasks.task !== undefined && state.tasks.task.data ? (state.tasks.task.data as TaskInProgressData).client : undefined;
        return contrast(client !== undefined ? client.color : undefined);
    });

    async function stopTask() {
        setFreeze(true);

        await props.stopTask(1500);

        await props.computeSummary();
        await props.listTasks();

        setTimeout(() => {
            setFreeze(false);
        }, 1500);
    }

    return (
        <div className={`${styles.task} ${task !== undefined ? styles.progress : ''}`} style={client !== undefined ? {background: `${client.color}`} : undefined}>
            <div>
                {
                    task !== undefined ? <Spinner freeze={freeze} color={client !== undefined ? client.color : undefined} contrast={contrastColor}></Spinner> : undefined
                }

                <button onClick={() => stopTask()} aria-label="Stop current task" className="ion-activatable" disabled={freeze} style={{'--color': contrastColor} as CSSProperties}>
                    <IonIcon icon={checkmarkCircle} />
                    <IonLabel>Stop</IonLabel>
                </button>
            </div>
        </div>
    );

}

export default rootConnector(Task);