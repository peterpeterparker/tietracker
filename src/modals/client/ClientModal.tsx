import React, { FormEvent, RefObject, createRef } from 'react';
import { IonHeader, IonContent, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel, IonInput } from '@ionic/react';

import { more } from 'ionicons/icons';

type ClientModalProps = {
    closeAction: Function;
}

type ClientState = {
    client: Client;
    valid: boolean;
}

class ClientModal extends React.Component<ClientModalProps, ClientState> {

    private colorRef: RefObject<any> = createRef();

    constructor(props: { closeAction: Function }) {
        super(props);

        this.state = {
            client: {
                name: undefined,
                color: `#${Math.floor(Math.random()*16777215).toString(16)}`
            },
            valid: false
        };
    }

    componentDidMount() {
        this.colorRef.current.addEventListener('colorChange', this.selectColor, false);
    }

    componentWillUnmount() {
        this.colorRef.current.removeEventListener('colorChange', this.selectColor, true);
    }

    private async handleSubmit($event: FormEvent<HTMLFormElement>) {
        $event.preventDefault();

        console.log(this.state);
    }

    private handleClientNameInput($event: CustomEvent<KeyboardEvent>) {
        const client: Client = { ...this.state.client };
        client.name = ($event.target as InputTargetEvent).value;
        this.setState({ client });
    }

    private validateClientName() {
        this.setState({ valid: this.state.client.name !== undefined && this.state.client.name.length >= 3 });
    }

    private selectColor = ($event: CustomEvent) => {
        const client: Client = { ...this.state.client };
        client.color = $event.detail.hex;
        this.setState({ client });
    }

    render() {
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
                            <IonInput value={this.state.client.name} debounce={500} minlength={3} maxlength={32} required={true} input-mode="text"
                                onIonInput={($event: CustomEvent<KeyboardEvent>) => this.handleClientNameInput($event)}
                                onIonChange={() => this.validateClientName()}>
                            </IonInput>
                        </IonItem>

                        <IonItem>
                            <IonLabel>Color</IonLabel>
                        </IonItem>

                        <IonItem>
                            <deckgo-color ref={this.colorRef} colorHex={this.state.client.color} className="ion-padding-start ion-padding-end ion-padding-bottom" more={true}>
                                <IonIcon icon={more} slot="more" aria-label="More" class="more"></IonIcon>
                            </deckgo-color>
                        </IonItem>
                    </IonList>

                    <IonButton type="submit" className="ion-margin-top" disabled={!this.state.valid}>
                        <IonLabel>Submit</IonLabel>
                    </IonButton>
                </form>
            </IonContent>
        </>
    };

}

export default ({ closeAction }: { closeAction: Function }) => (
    <ClientModal closeAction={closeAction}>
    </ClientModal>
)