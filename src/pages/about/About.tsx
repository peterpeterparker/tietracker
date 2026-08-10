import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonPage,
  IonToolbar,
} from '@ionic/react';
import {chevronBackOutline} from 'ionicons/icons';
import React from 'react';
import {Link} from 'react-router-dom';
import styles from './About.module.scss';

const About: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
        <main className="ion-padding">
          <IonHeader>
            <IonToolbar className="title">
              <IonButtons slot="start">
                <IonButton routerLink="/more" routerDirection="back">
                  <IonIcon icon={chevronBackOutline} slot="icon-only" />
                </IonButton>
              </IonButtons>
            </IonToolbar>
            <IonToolbar className="title">
              <div className={styles.intro}>
                <img src="assets/icon/logo.svg" alt="Tie Tracker logo" height="160" />

                <p>
                  <IonLabel className={styles.introLabel}>
                    <strong>Tie Tracker</strong> - A local-first time tracking app{' '}
                    <span aria-label="stopwatch" role="img">
                      ⏱
                    </span>
                    ️
                  </IonLabel>
                </p>
              </div>
            </IonToolbar>
          </IonHeader>

          <h1 className="ion-padding-top">Data</h1>

          <p>
            <IonLabel>
              Your data lives on your device or browser. There is no server or remote database.
            </IonLabel>
          </p>

          <p>
            <IonLabel>No analytics nor tracking - even anonymous - are implemented.</IonLabel>
          </p>

          <p>
            <IonLabel>
              On iOS, iCloud sync is used by default, so your data carries over when you switch to a
              new phone. This can be disabled. On other devices, use manual backup and restore to
              move your data yourself.
            </IonLabel>
          </p>

          <h1 className="ion-padding-top">Open Source</h1>

          <p>
            <IonLabel>
              Tie Tracker is open source and published under the AGPL v3 (or later) license. Its
              code is available on{' '}
              <a
                href="http://github.com/peterpeterparker/tietracker"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.github}>
                GitHub
              </a>
              .
            </IonLabel>
          </p>

          <h1 className="ion-padding-top">Contact</h1>

          <p>
            <IonLabel>
              Got a question, or a project that needs a freelance web developer? Reach me on{' '}
              <a href="https://daviddalbusco.com" target="_blank" rel="noopener noreferrer">
                my website
              </a>
              .
            </IonLabel>
          </p>

          <p className={styles.terms}>
            <IonLabel>
              <Link to="/terms">Terms of use</Link> - <Link to="/privacy">Privacy Policy</Link>
            </IonLabel>
          </p>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default About;
