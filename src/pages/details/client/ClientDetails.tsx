import React, {createRef, CSSProperties, FormEvent, RefObject, useEffect, useState} from 'react';
import {RouteComponentProps} from 'react-router';

import styles from './ClientDetails.module.scss';

import {rootConnector, RootProps} from '../../../store/thunks/index.thunks';
import {
    IonBackButton, IonButton,
    IonButtons,
    IonContent,
    IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList,
    IonPage, IonSpinner,
    IonTitle,
    IonToolbar, useIonViewDidEnter,
    useIonViewWillEnter, useIonViewWillLeave
} from '@ionic/react';

import {more} from 'ionicons/icons';

import {contrast} from '../../../utils/utils.color';

import {Client} from '../../../models/client';

import {ClientsService} from '../../../services/clients/clients.service';
import {TasksService} from '../../../services/tasks/tasks.service';

interface ClientDetailsProps extends RouteComponentProps<{
    id: string
}> {
}

type Props = RootProps & ClientDetailsProps;

const ClientDetails: React.FC<Props> = (props: Props) => {

    const clientColorRef: RefObject<any> = createRef();

    const [client, setClient] = useState<Client | undefined>(undefined);
    const [color, setColor] = useState<string | undefined>(undefined);

    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);

    const [valid, setValid] = useState<boolean>(true);

    useIonViewWillEnter(async () => {
        setSaving(false);

        const client: Client | undefined = await ClientsService.getInstance().find(props.match.params.id);
        setClient(client);

        setColor(client && client.data ? client.data.color : undefined);

        setLoading(false);
    });

    useEffect(() => {
        if (clientColorRef && clientColorRef.current) {
            clientColorRef.current.addEventListener('colorChange', selectColor, false);
        }
    }, [clientColorRef]);

    useIonViewWillLeave(() => {
        if (clientColorRef && clientColorRef.current) {
            clientColorRef.current.removeEventListener('colorChange', selectColor, true);
        }
    });

    function selectColor($event: CustomEvent) {
        if (client && client.data) {
            client.data.color = $event.detail.hex;

            setColor($event.detail.hex);
        }
    }

    function handleClientNameInput($event: CustomEvent<KeyboardEvent>) {
        if (client && client.data) {
            client.data.name = ($event.target as InputTargetEvent).value;
        }
    }

    function validateClientName() {
        setValid(client !== undefined && client.data !== undefined && client.data.name !== undefined && client.data.name.length >= 3);
    }

    async function handleSubmit($event: FormEvent<HTMLFormElement>) {
        $event.preventDefault();

        if (!client || !client.data) {
            return;
        }

        setSaving(true);

        try {
            await ClientsService.getInstance().update(client);

            await updateStore();

            props.history.push('/home');
        } catch (err) {
            // TODO show err
            console.error(err);
            setSaving(false);
        }
    }

    async function updateStore() {
        await props.initClients();
        await props.initActiveProjects();
        await props.listTasks();
        await props.listProjectsInvoices();
    }

    return (
        <IonPage>
            {renderContent()}
        </IonPage>
    );

    function renderContent() {
        const colorContrast: string = contrast(color);

        return <>
            <IonHeader>
                <IonToolbar style={{'--background': color, '--color': colorContrast} as CSSProperties}>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/home" style={{'--color': colorContrast} as CSSProperties}/>
                    </IonButtons>
                    <IonTitle>{client && client.data ? client.data.name : ''}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {renderClient(colorContrast)}
            </IonContent>
        </>
    }

    function renderClient(colorContrast: string) {
        if (loading || !client || !client.data) {
            return <div className="spinner"><IonSpinner color="primary"></IonSpinner></div>
        }

        return <form onSubmit={($event: FormEvent<HTMLFormElement>) => handleSubmit($event)}>
            <IonList className="inputs-list">
                <IonItem className="item-title">
                    <IonLabel>Company</IonLabel>
                </IonItem>
                <IonItem>
                    <IonInput debounce={500} minlength={3} maxlength={32}
                              required={true} input-mode="text" value={client.data.name}
                              onIonInput={($event: CustomEvent<KeyboardEvent>) => handleClientNameInput($event)}
                              onIonChange={() => validateClientName()}>
                    </IonInput>
                </IonItem>

                <IonItem className="item-title ion-margin-top">
                    <IonLabel>Color</IonLabel>
                </IonItem>

                <div className={styles.color}>
                    <deckgo-color className="ion-padding-start ion-padding-end ion-padding-bottom" ref={clientColorRef}
                                  more={true} color-hex={`${client.data.color}`}>
                        <IonIcon icon={more} slot="more" aria-label="More" class="more"></IonIcon>
                    </deckgo-color>
                </div>
            </IonList>

            <IonButton type="submit" disabled={saving || !valid} aria-label="Update task" className="ion-margin-top" style={{'--background': color, '--color': colorContrast, '--background-hover': color, '--color-hover': colorContrast, '--background-activated': colorContrast, '--color-activated': color} as CSSProperties}>
                <IonLabel>Update</IonLabel>
            </IonButton>
        </form>
    }

};

export default rootConnector(ClientDetails);
