import React from 'react';
import { useSelector } from 'react-redux';

import { IonCard, IonIcon, IonCardHeader, IonCardSubtitle, IonCardTitle, IonRippleEffect } from '@ionic/react';

import styles from './Invoices.module.scss';

import { RootState } from '../../store/reducers';
import { rootConnector, RootProps } from '../../store/thunks/index.thunks';

import { Invoice } from '../../store/interfaces/invoice';

const Invoices: React.FC<RootProps> = (props: RootProps) => {

    const invoices: Invoice[] = useSelector((state: RootState) => state.invoices.invoices);

    return (
        <>
            <h1>Open Invoices</h1>
            {renderProjects()}
        </>
    );

    function renderProjects() {
        if (!invoices || invoices.length <= 0) {
            return <p>No clients to bill.</p>
        }

        return <div className={styles.invoices}>
            {
                invoices.map((invoice: Invoice, i: number) => {
                    return <IonCard key={`invoice-${i}`} className="ion-activatable">
                        <div style={{ background: invoice.client ? invoice.client.color : undefined }}>
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