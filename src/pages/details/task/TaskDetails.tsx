import React, {CSSProperties, FormEvent, useState} from 'react';
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
    IonSpinner, IonLabel, IonItem, IonButton, IonInput
} from '@ionic/react';
import {RouteComponentProps} from 'react-router';

import {MuiPickersUtilsProvider, DateTimePicker} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import styles from './TaskDetails.module.scss';

import {Task} from '../../../models/task';
import {MaterialUiPickersDate} from '@material-ui/pickers/typings/date';
import {toDateObj} from '../../../utils/utils.date';
import {TasksService} from '../../../services/tasks/tasks.service';

import {rootConnector, RootProps} from '../../../store/thunks/index.thunks';

import {Client} from '../../../models/client';
import {Project} from '../../../models/project';
import {ProjectsService} from '../../../services/projects/projects.service';
import {ClientsService} from '../../../services/clients/clients.service';
import {contrast} from '../../../utils/utils.color';


interface TaskDetailsProps extends RouteComponentProps<{
    day: string,
    id: string
}> {
}

type Props = RootProps & TaskDetailsProps;

const TaskDetails: React.FC<Props> = (props: Props) => {

    const [task, setTask] = useState<Task | undefined>(undefined);
    const [from, setFrom] = useState<Date | undefined>(undefined);
    const [to, setTo] = useState<Date | undefined>(undefined);
    const [description, setDescription] = useState<string | undefined>(undefined);

    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);

    const [client, setClient] = useState<Client | undefined>(undefined);
    const [project, setProject] = useState<Project | undefined>(undefined);

    useIonViewWillEnter(async () => {
        setSaving(false);

        const task: Task | undefined = await TasksService.getInstance().find(props.match.params.id, props.match.params.day);
        setTask(task);

        if (task && task.data) {
            setFrom(toDateObj(task.data.from));
            setTo(toDateObj(task.data.to));
            setDescription(task.data.description);

            const project: Project | undefined = await ProjectsService.getInstance().find(task.data.project_id);
            setProject(project);

            const client: Client | undefined = await ClientsService.getInstance().find(task.data.client_id);
            setClient(client);

            setLoading(false);
        }
    });

    async function handleSubmit($event: FormEvent<HTMLFormElement>) {
        $event.preventDefault();

        if (!task || !task.data || from === undefined || to === undefined) {
            return;
        }

        setSaving(true);

        try {
            const taskToUpdate: Task = {...task};
            taskToUpdate.data.to = to.getTime();
            taskToUpdate.data.from = from.getTime();

            if (description && description !== undefined && description !== '') {
                taskToUpdate.data.description = description;
            } else {
                delete taskToUpdate.data['description'];
            }

            await TasksService.getInstance().update(task, props.match.params.day);

            await updateStore();

            props.history.push('/home');
        } catch (err) {
            // TODO show err
            console.error(err);
            setSaving(false);
        }
    }

    async function deleteTask() {
        if (!task || !task.data || from === undefined || to === undefined) {
            return;
        }

        setSaving(true);

        try {
            await TasksService.getInstance().delete(task, props.match.params.day);

            await updateStore();

            props.history.push('/home');
        } catch (err) {
            // TODO show err
            console.error(err);
            setSaving(false);
        }
    }

    async function updateStore() {
        await props.computeSummary();
        await props.listTasks();
        await props.listProjectsInvoices();
    }

    function onDescriptionChange($event: CustomEvent<KeyboardEvent>) {
        setDescription(($event.target as InputTargetEvent).value);
    }

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            {renderContent()}
        </MuiPickersUtilsProvider>
    );

    function renderContent() {
        const color: string = client && client.data && client.data.color ? client.data.color : 'var(--ion-color-primary)';
        const colorContrast: string = contrast(color);

        return <IonPage>
            <IonHeader>
                <IonToolbar style={{'--background': color, '--color': colorContrast} as CSSProperties}>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/home" style={{'--color': colorContrast} as CSSProperties}/>
                    </IonButtons>
                    <IonTitle>{client && client.data ? client.data.name + (project && project.data ? ` - ${project.data.name}` : '') : 'Task'}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {renderTask()}
            </IonContent>
        </IonPage>
    }

    function renderTask() {
        if (loading) {
            return <div className="spinner"><IonSpinner color="primary"></IonSpinner></div>
        }

        return <form onSubmit={($event: FormEvent<HTMLFormElement>) => handleSubmit($event)}>
            <IonList className="inputs-list">
                <IonItem className="item-title">
                    <IonLabel>Description</IonLabel>
                </IonItem>
                <IonItem>
                    <IonInput debounce={500} maxlength={256} value={description}
                              input-mode="text"
                              onIonInput={($event: CustomEvent<KeyboardEvent>) => onDescriptionChange($event)}>
                    </IonInput>
                </IonItem>

                <IonItem className="item-title">
                    <IonLabel>From</IonLabel>
                </IonItem>

                <IonItem className="item-input">
                    <DateTimePicker value={from} onChange={(date: MaterialUiPickersDate) => setFrom(date as Date)}
                                    ampm={false} hideTabs={true} format="yyyy/MM/dd HH:mm"/>
                </IonItem>

                <IonItem className="item-title">
                    <IonLabel>To</IonLabel>
                </IonItem>

                <IonItem className="item-input">
                    <DateTimePicker value={to} onChange={(date: MaterialUiPickersDate) => setTo(date as Date)}
                                    ampm={false} hideTabs={true} format="yyyy/MM/dd HH:mm"/>
                </IonItem>
            </IonList>

            <div className={styles.actions}>
                <IonButton type="submit" disabled={saving} aria-label="Update task">
                    <IonLabel>Update</IonLabel>
                </IonButton>

                <a href="#" onClick={() => deleteTask()} aria-label="Delete task"
                   aria-disabled={saving}><IonLabel>Delete</IonLabel></a>
            </div>
        </form>
    }
};

export default rootConnector(TaskDetails);
