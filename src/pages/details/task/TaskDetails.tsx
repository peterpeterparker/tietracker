import React, {CSSProperties, FormEvent, RefObject, useRef, useState} from 'react';
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
import {MaterialUiPickersDate} from '@material-ui/pickers/typings/date';

import DateFnsUtils from '@date-io/date-fns';

import styles from './TaskDetails.module.scss';

import {Task} from '../../../models/task';

import {Client} from '../../../models/client';
import {Project} from '../../../models/project';

import {toDateObj} from '../../../utils/utils.date';
import {contrast} from '../../../utils/utils.color';

import {rootConnector, RootProps} from '../../../store/thunks/index.thunks';

import {ProjectsService} from '../../../services/projects/projects.service';
import {ClientsService} from '../../../services/clients/clients.service';
import {TasksService} from '../../../services/tasks/tasks.service';

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

    const headerRef: RefObject<any> = useRef();

    useIonViewWillEnter(async () => {
        setSaving(false);
        setLoading(true);

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
        } else {
            setFrom(undefined);
            setTo(undefined);
            setDescription(undefined);
            setProject(undefined);
            setClient(undefined);
        }

        setLoading(false);
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

            goBack();
        } catch (err) {
            // TODO show err
            console.error(err);
        }

        setSaving(false);
    }

    async function deleteTask() {
        if (!task || !task.data || from === undefined || to === undefined) {
            return;
        }

        setSaving(true);

        try {
            await TasksService.getInstance().delete(task, props.match.params.day);

            await updateStore();

            goBack();
        } catch (err) {
            // TODO show err
            console.error(err);
        }

        setSaving(false);
    }

    function goBack() {
        // HACK: For an unknow reason, if I use history.push, if user select another task after redirect, parameters are not going to be reflected in RouteComponentProps
        if (headerRef && headerRef.current) {
            const backButton: HTMLElement = headerRef.current.querySelector('ion-back-button');
            backButton.click();
        } else {
            // In worst case, still better than no redirect in case of delete
            props.history.push('/home');
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
            <IonContent>
                <IonHeader ref={headerRef} >
                    <IonToolbar style={{'--background': color, '--color': colorContrast} as CSSProperties}>
                        <IonButtons slot="start">
                            <IonBackButton defaultHref="/home" style={{'--color': colorContrast} as CSSProperties}/>
                        </IonButtons>
                        <IonTitle>{client && client.data ? client.data.name + (project && project.data ? ` - ${project.data.name}` : '') : 'Task'}</IonTitle>
                    </IonToolbar>
                </IonHeader>

                <main className="ion-padding">
                    {renderTask(color, colorContrast)}
                </main>
            </IonContent>
        </IonPage>
    }

    function renderTask(color: string, colorContrast: string) {
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
                <IonButton type="submit" disabled={saving} aria-label="Update task" style={{'--background': color, '--color': colorContrast, '--background-hover': color, '--color-hover': colorContrast, '--background-activated': colorContrast, '--color-activated': color} as CSSProperties}>
                    <IonLabel>Update</IonLabel>
                </IonButton>

                <button type="button" onClick={() => deleteTask()} aria-label="Delete task"
                        aria-disabled={saving}><IonLabel>Delete</IonLabel></button>
            </div>
        </form>
    }
};

export default rootConnector(TaskDetails);
