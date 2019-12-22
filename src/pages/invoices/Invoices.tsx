import React from 'react';
import {
    IonHeader,
    IonToolbar,
    IonPage,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardSubtitle, IonCardTitle, IonRippleEffect
} from '@ionic/react';

import {useSelector} from 'react-redux';

import styles from './Invoices.module.scss';

import {rootConnector} from '../../store/thunks/index.thunks';
import {RootState} from '../../store/reducers';
import {Invoice} from '../../models/invoice';

const Invoices: React.FC = () => {

    const invoices: Invoice[] = useSelector((state: RootState) => state.invoices.invoices);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Open Invoices</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <main>
                    {renderProjects()}
                </main>
            </IonContent>
        </IonPage>
    );

    function renderProjects() {
        if (!invoices || invoices.length <= 0) {
            return <p>No clients to bill.</p>
        }

        return <div className={styles.invoices}>
            {
                invoices.map((invoice: Invoice, i: number) => {
                    return <IonCard key={`invoice-${i}`} className="ion-activatable">
                        <div style={{background: invoice.client ? invoice.client.color : undefined}}>
                            <h1>{invoice.client ? invoice.client.name : ''}</h1>
                        </div>
                        <IonCardHeader>
                            <IonCardSubtitle>{invoice.billable} CHF</IonCardSubtitle>
                            <IonCardTitle>{invoice.project.name}</IonCardTitle>
                        </IonCardHeader>
                        <IonRippleEffect></IonRippleEffect>
                    </IonCard>
                })
            }
        </div>
    }

};

export default rootConnector(Invoices);
