import React, { FormEvent, RefObject, createRef } from 'react';
import { IonHeader, IonContent, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel, IonInput } from '@ionic/react';

import { more } from 'ionicons/icons';

import styles from './ClientModal.module.scss';

import { Client, ClientData } from '../../models/client';
import { RootProps, rootConnector } from '../../store/thunks/index.thunks';
import { ProjectData } from '../../models/project';

type ClientState = {
    clientData?: ClientData;
    projectData?: ProjectData;
    valid: {
        client: boolean,
        project: boolean
    }
}

type Props = RootProps & {
    closeAction: Function
}

class ClientModal extends React.Component<Props, ClientState> {

    private colorRef: RefObject<any> = createRef();

    constructor(props: Props) {
        super(props);

        this.state = {
            valid: {
                client: false,
                project: false
            }
        };
    }

    componentDidMount() {
        this.colorRef.current.addEventListener('colorChange', this.selectColor, false);
    }

    componentWillUnmount() {
        this.colorRef.current.removeEventListener('colorChange', this.selectColor, true);
    }

    private handleClientNameInput($event: CustomEvent<KeyboardEvent>) {
        let data: ClientData;

        if (this.state.clientData) {
            data = { ...this.state.clientData };
            data.name = ($event.target as InputTargetEvent).value;
        } else {
            data = {
                name: ($event.target as InputTargetEvent).value
            };
        }

        this.setState({ clientData: data });
    }

    private validateClientName() {
        const valid = { ...this.state.valid };
        valid.client = this.state.clientData !== undefined && this.state.clientData.name !== undefined && this.state.clientData.name.length >= 3;
        this.setState({ valid });
    }

    private selectColor = ($event: CustomEvent) => {
        if (!this.state.clientData) {
            return;
        }

        const data: ClientData = { ...this.state.clientData };
        data.color = $event.detail.hex;
        this.setState({ clientData: data });
    }

    private handleProjectNameInput($event: CustomEvent<KeyboardEvent>) {
        if (!this.state.clientData) {
            return;
        }

        let data: ProjectData;

        if (this.state.projectData) {
            data = { ...this.state.projectData };
            data.name = ($event.target as InputTargetEvent).value;
        } else {
            data = {
                name: ($event.target as InputTargetEvent).value,
                from: new Date().getTime(),
                rate: {
                    hourly: 0,
                    vat: true
                }
            };
        }

        this.setState({ projectData: data });
    }

    private handleProjectRateInput($event: CustomEvent<KeyboardEvent>) {
        if (!this.state.clientData) {
            return;
        }

        let data: ProjectData;

        if (this.state.projectData) {
            data = { ...this.state.projectData };
            data.rate.hourly = parseInt(($event.target as InputTargetEvent).value);
        } else {
            data = {
                name: '',
                from: new Date().getTime(),
                rate: {
                    hourly: parseInt(($event.target as InputTargetEvent).value),
                    vat: true
                }
            };
        }

        this.setState({ projectData: data });
    }

    private validateProject() {
        const valid = { ...this.state.valid };
        valid.project = this.state.projectData !== undefined && this.state.projectData.name !== undefined && this.state.projectData.name.length >= 3 && this.state.projectData.rate && this.state.projectData.rate.hourly >= 0;
        this.setState({ valid });
    }

    private async handleSubmit($event: FormEvent<HTMLFormElement>) {
        $event.preventDefault();

        if (this.state.clientData === undefined || this.state.projectData === undefined) {
            return;
        }

        try {
            const persistedClient: Client = await this.props.createClient(this.state.clientData);

            if (!persistedClient || persistedClient === undefined || !persistedClient.id || persistedClient.id === undefined) {
                // TODO: Error management
                // And what if client withtout project? duplicated? -> delete whatever function
                console.error('Client not created');
                return;
            }

            await this.props.createProject(persistedClient, this.state.projectData);

            await this.props.closeAction();
        } catch (err) {
            console.error(err);
        }
    }

    render() {
        const valid: boolean = this.state.valid.client && this.state.valid.project;

        return <>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>Add a new client</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => this.props.closeAction()}>
                            <IonIcon name="close" slot="icon-only"></IonIcon>
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <main>
                    <form onSubmit={($event: FormEvent<HTMLFormElement>) => this.handleSubmit($event)}>
                        <IonList className="inputs-list">
                            <IonItem className="item-title">
                                <IonLabel>Company</IonLabel>
                            </IonItem>
                            <IonItem>
                                <IonInput debounce={500} minlength={3} maxlength={32} required={true} input-mode="text"
                                          onIonInput={($event: CustomEvent<KeyboardEvent>) => this.handleClientNameInput($event)}
                                          onIonChange={() => this.validateClientName()}>
                                </IonInput>
                            </IonItem>

                            <IonItem disabled={!this.state.valid.client} className="item-title ion-margin-top">
                                <IonLabel>Color</IonLabel>
                            </IonItem>

                            <IonItem disabled={!this.state.valid.client} className={styles.color}>
                                <deckgo-color ref={this.colorRef} className="ion-padding-start ion-padding-end ion-padding-bottom" more={true}>
                                    <IonIcon icon={more} slot="more" aria-label="More" class="more"></IonIcon>
                                </deckgo-color>
                            </IonItem>

                            <IonItem disabled={!this.state.valid.client} className="item-title ion-margin-top">
                                <IonLabel>Project</IonLabel>
                            </IonItem>
                            <IonItem disabled={!this.state.valid.client}>
                                <IonInput debounce={500} minlength={3} maxlength={32} required={true} input-mode="text"
                                          onIonInput={($event: CustomEvent<KeyboardEvent>) => this.handleProjectNameInput($event)}
                                          onIonChange={() => this.validateProject()}>
                                </IonInput>
                            </IonItem>

                            <IonItem disabled={!this.state.valid.client} className="item-title">
                                <IonLabel>Hourly rate</IonLabel>
                            </IonItem>
                            <IonItem disabled={!this.state.valid.client}>
                                <IonInput debounce={500} minlength={1} required={true} input-mode="text"
                                          onIonInput={($event: CustomEvent<KeyboardEvent>) => this.handleProjectRateInput($event)}
                                          onIonChange={() => this.validateProject()}>
                                </IonInput>
                            </IonItem>
                        </IonList>

                        <IonButton type="submit" className="ion-margin-top" disabled={!valid}>
                            <IonLabel>Submit</IonLabel>
                        </IonButton>
                    </form>
                </main>
            </IonContent>
        </>
    };

}

export default rootConnector(ClientModal);
