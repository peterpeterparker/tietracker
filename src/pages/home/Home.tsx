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

import { useTranslation } from 'react-i18next';

import './Home.scss';

import Company from '../../modals/company/Company';

const Home: React.FC = () => {

  const { t } = useTranslation('home');

  const [showModal, setShowModal] = useState(false);

  async function closeModal() {
    await setShowModal(false);
  }

  return (
    <IonPage>
      <IonContent className="ion-padding">

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <Company closeAction={closeModal}></Company>
        </IonModal>

        <main>
          <IonHeader><IonToolbar><IonSearchbar placeholder={t('search.companies')}></IonSearchbar></IonToolbar></IonHeader>

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

          <h1 className="ion-padding">Track</h1>

          <IonButton expand="block">Start</IonButton>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default Home;
