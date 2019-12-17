import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonSearchbar,
  IonBadge,
  IonButton,
  IonModal
} from '@ionic/react';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { useTranslation } from 'react-i18next';

import './Home.scss';

import ClientModal from '../../modals/client/ClientModal';

import { RootState } from '../../store/reducers';
import { Client } from '../../models/client';
import Projects from '../../components/projects/Projects';

const Home: React.FC = () => {

  const { t } = useTranslation('home');

  const [showModal, setShowModal] = useState(false);
  const clients: Client[] = useSelector((state: RootState) => state.clients.clients);  

  async function closeModal() {
    await setShowModal(false);
  }

  return (
    <IonPage>
      <IonContent className="ion-padding-start ion-padding-bottom ion-padding-top">

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <ClientModal closeAction={closeModal}></ClientModal>
        </IonModal>

        <main>
          <IonHeader className="ion-padding-end"><IonToolbar><IonSearchbar placeholder={t('search.companies')}></IonSearchbar></IonToolbar></IonHeader>

          <IonButton onClick={() => setShowModal(true)}>New</IonButton>

          <h1 className="ion-padding">{t('week.summary')}</h1>

          <IonCard className="welcome-card">
            <IonCardHeader>
              <IonCardSubtitle>Hours tracked: 45h</IonCardSubtitle>
              <IonCardTitle>Billable amount: 1'200 CHF</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>Top projects:</p>
              <IonBadge>Project 1</IonBadge> <IonBadge>Project 2</IonBadge> <IonBadge>Project 3</IonBadge>
            </IonCardContent>
          </IonCard>

          <Projects></Projects>

          <h1>All Clients</h1>

          {
            clients.map((client: Client, i: number) => {
              return <div key={i}>{client.data.name}</div>
            })
          }
        </main>
      </IonContent>
    </IonPage>
  );
};

export default Home;
