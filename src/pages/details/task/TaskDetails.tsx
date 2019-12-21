import React, {useState} from 'react';
import {
    IonBackButton,
    IonButtons,
    IonHeader,
    IonPage,
    IonToolbar,
    IonTitle,
    IonContent,
    useIonViewWillEnter
} from '@ionic/react';
import {RouteComponentProps} from 'react-router';

import {get} from 'idb-keyval';

import {Task} from '../../../models/task';

interface TaskDetailsProps extends RouteComponentProps<{
    day: string,
    id: string
}> {
}

const TaskDetails: React.FC<TaskDetailsProps> = ({match}) => {

    const [task, setTask] = useState<Task | undefined>(undefined);

    useIonViewWillEnter(async () => {
        setTask(await findTask());
    });

    function findTask(): Promise<Task> {
        return new Promise<Task>(async (resolve) => {
            if (!match.params.id || match.params.id === undefined || !match.params.day || match.params.day === undefined) {
                resolve();
                return;
            }

            const tasks: Task[] = await get(`tasks-${match.params.day}`);

            if (!tasks || tasks.length <= 0) {
                resolve();
                return;
            }

            const task: Task | undefined = tasks.find((filteredTask: Task) => {
                return filteredTask.id === match.params.id;
            });

            resolve(task);
        });
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/tab2"/>
                    </IonButtons>
                    <IonTitle>Detail</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <p>Details {task !== undefined ? task.id : 'nope'}</p>
            </IonContent>
        </IonPage>
    );
};

export default TaskDetails;
