import React, { RefObject } from 'react';
import { IonHeader, IonContent, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/react';

class Company extends React.Component {

    headerRef: RefObject<HTMLIonHeaderElement> = React.createRef();

    async closeModal() {
        if (!this.headerRef || !this.headerRef.current) {
            return;
        }

        await (this.headerRef.current.closest('ion-modal') as HTMLIonModalElement).dismiss();
    }

    render() {
        return <>
            <IonHeader ref={this.headerRef}>
                <IonToolbar color="primary">
                    <IonTitle></IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => this.closeModal()}>
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

export default Company;