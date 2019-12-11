import React from 'react';
import { IonHeader, IonContent, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/react';

type CompanyProps = {
    closeAction: Function;
}

class Company extends React.Component<CompanyProps> {

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
    <Company closeAction={closeAction}>
    </Company>
)