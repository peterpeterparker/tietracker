import React from 'react';
import { useSelector } from 'react-redux';

import styles from './Task.module.scss';

import { RootState } from '../../store/reducers';
import { rootConnector, RootProps } from '../../store/thunks/index.thunks';

import { Task as TaskModel, TaskInProgressClientData, TaskInProgressData } from '../../models/task';

const Task: React.FC<RootProps> = (props: RootProps) => {

    const task: TaskModel | undefined = useSelector((state: RootState) => state.taskInProgress.task);

    const client: TaskInProgressClientData | undefined = useSelector((state: RootState) => {
        return state.taskInProgress.task !== undefined && state.taskInProgress.task.data ? (state.taskInProgress.task.data as TaskInProgressData).client : undefined
    });

    async function stopTask() {
        await props.stopTask();
    }

    return (
        <div className={`${styles.task} ${task !== undefined ? styles.progress : ''}`} style={client !== undefined ? {background: `${client.color}`} : undefined}>
            <button onClick={() => stopTask()}>Stop</button>
        </div>
    );

}

export default rootConnector(Task);