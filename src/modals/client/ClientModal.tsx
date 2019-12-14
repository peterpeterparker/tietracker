import React, { FormEvent, RefObject, createRef } from 'react';
import { IonHeader, IonContent, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel, IonInput } from '@ionic/react';

import { connect, ConnectedProps } from 'react-redux';

import { more } from 'ionicons/icons';

import { get, set } from 'idb-keyval';

import { Client } from '../../models/client';

import { RootState } from '../../store/reducers/index';

const mapState = (state: RootState) => ({
    clients: state.clients.clients
});

const mapDispatch = {
    addClient: (newClient: Client) => ({ type: 'ADD_CLIENT', payload: newClient })
};

const connector = connect(
    mapState,
    mapDispatch
);

// The inferred type will look like:
// {clients: Client[], addClient: (newClient: Client) => void}
type PropsFromRedux = ConnectedProps<typeof connector>;

type ClientState = {
    client?: Client;
    valid: {
        client: boolean,
        project: boolean
    }
}

type Props = PropsFromRedux & {
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
        let client: Client;

        if (this.state.client) {
            client = { ...this.state.client };
            client.name = ($event.target as InputTargetEvent).value;
        } else {
            client = {
                name: ($event.target as InputTargetEvent).value
            };
        }

        this.setState({ client });
    }

    private validateClientName() {
        const valid = { ...this.state.valid };
        valid.client = this.state.client !== undefined && this.state.client.name !== undefined && this.state.client.name.length >= 3;
        this.setState({ valid });
    }

    private selectColor = ($event: CustomEvent) => {
        if (!this.state.client) {
            return;
        }

        const client: Client = { ...this.state.client };
        client.color = $event.detail.hex;
        this.setState({ client });
    }

    private handleProjectNameInput($event: CustomEvent<KeyboardEvent>) {
        if (!this.state.client) {
            return;
        }

        const client: Client = { ...this.state.client };

        if (!client.projects || client.projects.length === 0) {
            client.projects = [];

            client.projects.push({
                name: ($event.target as InputTargetEvent).value
            });
        } else {
            client.projects[0].name = ($event.target as InputTargetEvent).value;
        }

        this.setState({ client });
    }

    private validateProjectName() {
        const valid = { ...this.state.valid };

        valid.project = this.state.client !== undefined && this.state.client.projects !== undefined && this.state.client.projects.length > 0 && this.state.client.projects[0].name.length >= 3;
        this.setState({ valid });
    }

    private async handleSubmit($event: FormEvent<HTMLFormElement>) {
        $event.preventDefault();

        // TODO: Plug to redux
        if (this.state.client === undefined) {
            return;
        }

        let clients: Client[] = await get('clients');

        if (!clients || clients.length <= 0) {
            clients = [];
        }

        const client: Client = this.state.client;

        if (!client.color) {
            client.color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        }

        clients.push(client);

        set('clients', clients);

        this.props.addClient(client);
    }

    render() {
        const valid: boolean = this.state.valid.client && this.state.valid.project;

        return <>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>New client</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => this.props.closeAction()}>
                            <IonIcon name="close" slot="icon-only"></IonIcon>
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <form onSubmit={($event: FormEvent<HTMLFormElement>) => this.handleSubmit($event)}>
                    <IonList>
                        <IonItem>
                            <IonLabel>Name</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonInput debounce={500} minlength={3} maxlength={32} required={true} input-mode="text"
                                onIonInput={($event: CustomEvent<KeyboardEvent>) => this.handleClientNameInput($event)}
                                onIonChange={() => this.validateClientName()}>
                            </IonInput>
                        </IonItem>

                        <IonItem disabled={!this.state.valid.client}>
                            <IonLabel>Color</IonLabel>
                        </IonItem>

                        <IonItem disabled={!this.state.valid.client}>
                            <deckgo-color ref={this.colorRef} className="ion-padding-start ion-padding-end ion-padding-bottom" more={true}>
                                <IonIcon icon={more} slot="more" aria-label="More" class="more"></IonIcon>
                            </deckgo-color>
                        </IonItem>

                        <IonItem disabled={!this.state.valid.client}>
                            <IonLabel>Project</IonLabel>
                        </IonItem>
                        <IonItem disabled={!this.state.valid.client}>
                            <IonInput debounce={500} minlength={3} maxlength={32} required={true} input-mode="text"
                                onIonInput={($event: CustomEvent<KeyboardEvent>) => this.handleProjectNameInput($event)}
                                onIonChange={() => this.validateProjectName()}>
                            </IonInput>
                        </IonItem>
                    </IonList>

                    <IonButton type="submit" className="ion-margin-top" disabled={!valid}>
                        <IonLabel>Submit</IonLabel>
                    </IonButton>
                </form>
            </IonContent>
        </>
    };

}

export default connector(ClientModal);