import React, {FormEvent, useEffect, useState} from 'react';
import {
    IonBackButton,
    IonButtons,
    IonHeader,
    IonPage,
    IonToolbar,
    IonTitle,
    IonContent,
    useIonViewWillEnter,
    IonList,
    IonSpinner, IonLabel, IonItem, IonButton
} from '@ionic/react';
import {RouteComponentProps} from 'react-router';

import {MuiPickersUtilsProvider, DateTimePicker} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import {get} from 'idb-keyval';

import styles from './TaskDetails.module.scss';

import {Task} from '../../../models/task';
import {MaterialUiPickersDate} from '@material-ui/pickers/typings/date';
import {toDateObj} from '../../../utils/utils.date';

interface TaskDetailsProps extends RouteComponentProps<{
    day: string,
    id: string
}> {
}

const TaskDetails: React.FC<TaskDetailsProps> = ({match, history}) => {

    const [task, setTask] = useState<Task | undefined>(undefined);
    const [from, setFrom] = useState<Date | undefined>(undefined);
    const [to, setTo] = useState<Date | undefined>(undefined);

    const [loading, setLoading] = useState<boolean>(true);

    useIonViewWillEnter(async () => {
        setTask(await findTask());
    });

    useEffect(() => {
        if (task && task.data) {
            setFrom(toDateObj(task.data.from));
            setTo(toDateObj(task.data.to));

            setLoading(false);
        }
    }, [task]);

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

    async function handleSubmit($event: FormEvent<HTMLFormElement>) {
        $event.preventDefault();

        history.push('/home');
    }

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonBackButton defaultHref="/home"/>
                        </IonButtons>
                        <IonTitle>Task</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    {renderTask()}
                </IonContent>
            </IonPage>
        </MuiPickersUtilsProvider>
    );

    function renderTask() {
        if (loading) {
            return <div className={styles.spinner}><IonSpinner color="primary"></IonSpinner></div>
        }

        return <form onSubmit={($event: FormEvent<HTMLFormElement>) => handleSubmit($event)}>
            <IonList className="inputs-list">
                <IonItem className="item-title">
                    <IonLabel>From</IonLabel>
                </IonItem>

                <IonItem className="item-input">
                    <DateTimePicker value={from} onChange={(date: MaterialUiPickersDate) => setFrom(date as Date)} ampm={false} hideTabs={true} format="yyyy/MM/dd HH:mm"/>
                </IonItem>

                <IonItem className="item-title">
                    <IonLabel>To</IonLabel>
                </IonItem>

                <IonItem className="item-input">
                    <DateTimePicker value={to} onChange={(date: MaterialUiPickersDate) => setTo(date as Date)} ampm={false} hideTabs={true} format="yyyy/MM/dd HH:mm"/>
                </IonItem>
            </IonList>

            <IonButton type="submit" className="ion-margin-top">
                <IonLabel>Save</IonLabel>
            </IonButton>
        </form>
    }
};

export default TaskDetails;
