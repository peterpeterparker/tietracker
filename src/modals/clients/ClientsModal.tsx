import React, {createRef, CSSProperties, RefObject, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import styles from './ClientsModal.module.scss';

import {rootConnector, RootProps} from '../../store/thunks/index.thunks';
import {RootState} from '../../store/reducers';

import {Client} from '../../models/client';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon, IonItem, IonList,
    IonSearchbar,
    IonTitle,
    IonToolbar,
    IonLabel
} from '@ionic/react';

interface Props extends RootProps {
    closeAction: Function;
    isOpen: boolean;
}

const ClientsModal: React.FC<Props> = (props) => {

    const filterRef: RefObject<any> = createRef();

    const clients: Client[] = useSelector((state: RootState) => state.clients.clients);

    const [filteredClients, setFilteredClients] = useState<Client[] | undefined>(undefined);

    useEffect(() => {
        if (props.isOpen) {
            // HACK: add a timeout
            setTimeout(async () => {
                await filterRef.current.setFocus();
            }, 100);
        }

        setFilteredClients(clients);
    }, [props.isOpen, clients]);

    async function onFilter($event: CustomEvent<KeyboardEvent>) {
        if (!$event) {
            return;
        }

        const input: string = ($event.target as InputTargetEvent).value;

        if (!input || input === undefined || input === '') {
            setFilteredClients(clients);
        } else {
            const clients: Client[] = await filterClients(input);
            setFilteredClients(clients);
        }
    }

    function filterClients(filter: string): Promise<Client[]> {
        return new Promise<Client[]>((resolve) => {
            if (!clients || clients.length <= 0) {
                resolve([]);
                return;
            }

            const results: Client[] = clients.filter((client: Client) => {
                return client.data.name && client.data.name.toLowerCase().indexOf(filter.toLowerCase()) > -1;
            });

            resolve(results);
        });
    }

    return (
        <>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>Search clients</IonTitle>
                    <IonButtons slot="start">
                        <IonButton onClick={() => props.closeAction()}>
                            <IonIcon name="close" slot="icon-only"></IonIcon>
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <main>
                    <IonSearchbar debounce={500} placeholder="Filter clients" className={styles.searchbar}
                                  ref={filterRef}
                                  onIonInput={($event: CustomEvent<KeyboardEvent>) => onFilter($event)}
                    ></IonSearchbar>

                    <IonList className="ion-margin-top">
                        {renderClients()}
                    </IonList>
                </main>
            </IonContent>
        </>
    );

    function renderClients() {
        if (!filteredClients || filteredClients.length <= 0) {
            return <IonItem className={styles.item + ' ' + styles.label} lines="none" detail={false}><IonLabel>No
                matching clients</IonLabel></IonItem>;
        }

        return filteredClients.map((client: Client) => {
            return <IonItem className={styles.item} lines="none" detail={false}>
                <div slot="start" style={{'background': client.data.color} as CSSProperties}></div>

                <IonLabel><h2>{client.data.name}</h2></IonLabel>
            </IonItem>
        })
    }

};

export default rootConnector(ClientsModal);
