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

import styles from './Home.module.scss';

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

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} cssClass="fullscreen">
          <ClientModal closeAction={closeModal}></ClientModal>
        </IonModal>

        <main>
          <IonHeader className="ion-padding-end"><IonToolbar><IonSearchbar placeholder={t('search.companies')} className={styles.searchbar}></IonSearchbar></IonToolbar></IonHeader>

          <div className={styles.addclient}>
            <IonButton onClick={() => setShowModal(true)} fill="outline" color="medium">Add a new client</IonButton>
          </div>

          <Summary></Summary>

          <Projects></Projects>

          <Tasks></Tasks>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default Home;
