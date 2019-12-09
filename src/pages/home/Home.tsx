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
  IonSearchbar
} from '@ionic/react';
import { book, build, colorFill, grid } from 'ionicons/icons';
import React from 'react';

import './Home.scss';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonContent className="ion-padding">
        <main>
          <IonHeader><IonToolbar><IonSearchbar></IonSearchbar></IonToolbar></IonHeader>

          <h1>This week in numbers:</h1>

          <IonCard className="welcome-card">
            <img src="/assets/shapes.svg" alt="" />
            <IonCardHeader>
              <IonCardSubtitle>Get Started</IonCardSubtitle>
              <IonCardTitle>Welcome to Ionic</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>
                Now that your app has been created, you'll want to start building out features and
                components. Check out some of the resources below for next steps.
            </p>
            </IonCardContent>
          </IonCard>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default Home;
