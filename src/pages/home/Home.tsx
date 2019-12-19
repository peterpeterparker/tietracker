import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonSearchbar,
  IonButton,
  IonModal
} from '@ionic/react';

import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';

import './Home.scss';

import ClientModal from '../../modals/client/ClientModal';

import Projects from '../../components/projects/Projects';
import Summary from '../../components/summary/Summary';
import Tasks from '../../components/tasks/Tasks';

const Home: React.FC = () => {

  const { t } = useTranslation('home');

  const [showModal, setShowModal] = useState(false);

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

          <Summary></Summary>

          <Projects></Projects>

          <h1>Liste</h1>

          <p>Liste des clients à facturer</p>

          <Tasks></Tasks>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default Home;
