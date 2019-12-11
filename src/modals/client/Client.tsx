import React from 'react';
import { IonHeader, IonContent, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/react';

type ClientProps = {
    closeAction: Function;
}

class Client extends React.Component<ClientProps> {

    render() {
        return <>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle></IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => this.props.closeAction()}>
                            <IonIcon name="close" slot="icon-only"></IonIcon>
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">

            </IonContent>
        </>
    };

}

export default ({ closeAction }: { closeAction: Function }) => (
    <Client closeAction={closeAction}>
    </Client>
)