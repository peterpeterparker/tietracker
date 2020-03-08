import React from 'react';

import {IonContent, IonHeader, IonPage, IonToolbar} from '@ionic/react';

import {useTranslation} from 'react-i18next';

import {rootConnector} from '../../store/thunks/index.thunks';

import Header from '../../components/header/Header';
import Summary from '../../components/summary/Summary';

const Statistics: React.FC = () => {

    const {t} = useTranslation('statistics');

    return (
        <IonPage>
            <IonContent>
                <Header></Header>

                <main className="ion-padding">
                    <IonHeader>
                        <IonToolbar className="title">
                            <h1>{t('title')}</h1>
                        </IonToolbar>
                    </IonHeader>

                    <Summary></Summary>
                </main>
            </IonContent>
        </IonPage>
    );
};

export default rootConnector(Statistics);
