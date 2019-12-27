import React from 'react';
import {
    IonPage,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardSubtitle, IonCardTitle, IonRippleEffect, IonIcon
} from '@ionic/react';

import {useSelector} from 'react-redux';

import {cash} from 'ionicons/icons';

import styles from './Invoices.module.scss';

import {rootConnector} from '../../store/thunks/index.thunks';
import {RootState} from '../../store/reducers';
import {Invoice} from '../../store/interfaces/invoice';

import {formatCurrency} from '../../utils/utils.currency';

import {Settings} from '../../models/settings';

import Header from '../../components/header/Header';

const Invoices: React.FC = () => {

    const invoices: Invoice[] = useSelector((state: RootState) => state.invoices.invoices);
    const settings: Settings = useSelector((state: RootState) => state.settings.settings);

    return (
        <IonPage>
            <IonContent>
                <Header></Header>

                <main className="ion-padding">
                    <h1>Open Invoices</h1>

                    {renderProjects()}
                </main>
            </IonContent>
        </IonPage>
    );

    function renderProjects() {
        if (!invoices || invoices.length <= 0) {
            return <p>No clients need to be billed currently.</p>
        }

        return <div className={styles.invoices}>
            {
                invoices.map((invoice: Invoice, i: number) => {
                    return <IonCard key={`invoice-${i}`} className="ion-activatable client">
                        <div style={{background: invoice.client ? invoice.client.color : undefined}}>
                            <IonIcon icon={cash} />
                        </div>
                        <IonCardHeader>
                            <IonCardSubtitle>{formatCurrency(invoice.billable, settings.currency)}</IonCardSubtitle>
                            <IonCardTitle>{invoice.client ? invoice.client.name : ''}</IonCardTitle>
                        </IonCardHeader>
                        <IonRippleEffect></IonRippleEffect>
                    </IonCard>
                })
            }
        </div>
    }

};

export default rootConnector(Invoices);
