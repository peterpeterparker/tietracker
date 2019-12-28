import React, {CSSProperties} from 'react';
import {IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar} from '@ionic/react';

import {rootConnector, RootProps} from '../../store/thunks/index.thunks';

import {Invoice} from '../../store/interfaces/invoice';

import {contrast} from '../../utils/utils.color';

import {ThemeService} from '../../services/theme/theme.service';

interface Props extends RootProps {
    closeAction: Function;
    invoice: Invoice | undefined;
}

const InvoiceModal: React.FC<Props> = (props) => {

    const color: string | undefined = props.invoice !== undefined && props.invoice.client ? props.invoice.client.color : undefined;
    const colorContrast: string = contrast(color, 128, ThemeService.getInstance().isDark());

    return (
        <IonContent>
            <IonHeader>
                <IonToolbar style={{'--background': color, '--color':colorContrast} as CSSProperties}>
                    <IonTitle>{props.invoice !== undefined && props.invoice.client && props.invoice.client.name !== undefined ? props.invoice.client.name : ''}</IonTitle>
                    <IonButtons slot="start">
                        <IonButton onClick={() => props.closeAction()}>
                            <IonIcon name="close" slot="icon-only"></IonIcon>
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <main className="ion-padding">

            </main>
        </IonContent>
    );

};

export default rootConnector(InvoiceModal);
