import React, { FormEvent } from 'react';
import { IonHeader, IonContent, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel, IonInput } from '@ionic/react';

type ClientModalProps = {
    closeAction: Function;
}

type ClientState = {
    client: Client;
    valid: boolean;
}

class ClientModal extends React.Component<ClientModalProps, ClientState> {

    constructor(props: { closeAction: Function }) {
        super(props);

        this.state = {
          client: {
              name: undefined
          },
          valid: false
        };
      }

    private async handleSubmit($event: FormEvent<HTMLFormElement>) {
        $event.preventDefault();

        console.log(this.state);
    }

    private handleClientNameInput($event: CustomEvent<KeyboardEvent>) {
        const client: Client = {...this.state.client}
        client.name = ($event.target as InputTargetEvent).value;
        this.setState({client});
    }

    private validateClientName() {
        this.setState({valid: this.state.client.name !== undefined && this.state.client.name.length >= 3});
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
                            <IonInput value={this.state.client.name}  debounce={500} minlength={3} maxlength={32} required={true} input-mode="text"
                                            onIonInput={($event: CustomEvent<KeyboardEvent>) => this.handleClientNameInput($event)}
                                            onIonChange={() => this.validateClientName()}>
                            </IonInput>
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