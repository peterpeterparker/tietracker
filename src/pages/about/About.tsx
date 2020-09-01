import React from 'react';
import {Link} from 'react-router-dom';
import {IonContent, IonPage, IonLabel, IonIcon, IonHeader, IonToolbar} from '@ionic/react';

import Header from '../../components/header/Header';

import styles from './About.module.scss';

import {logoTwitter, globe, logoGithub} from 'ionicons/icons';

const About: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
        <Header></Header>

        <main className="ion-padding">
          <IonHeader>
            <IonToolbar className="title">
              <h1>About</h1>
            </IonToolbar>
          </IonHeader>

          <div className={styles.intro}>
            <img src="assets/icon/logo.svg" alt="Tie Tracker logo" height="160" />

            <p>
              <IonLabel>
                <strong>Tie Tracker</strong> - A simple, open source and free time tracking app{' '}
                <span aria-label="stopwatch" role="img">
                  ⏱
                </span>
                ️
              </IonLabel>
            </p>
          </div>

          <p>
            <IonLabel>It is meant to be simple and has the goal to lets you track work hours across projects.</IonLabel>
          </p>

          <h1 className="ion-padding-top">Features</h1>

          <p>
            <IonLabel>Track your productivity and billable hours.</IonLabel>
          </p>

          <ul className={styles.list}>
            <li>
              <span aria-label="checkmark" role="img">
                ✅
              </span>{' '}
              Simple work hours tracking
            </li>
            <li>
              <span aria-label="checkmark" role="img">
                ✅
              </span>{' '}
              Assign time to clients and projects
            </li>
            <li>
              <span aria-label="checkmark" role="img">
                ✅
              </span>{' '}
              Define budget per projects
            </li>
            <li>
              <span aria-label="checkmark" role="img">
                ✅
              </span>{' '}
              Mark entries as charges
            </li>
          </ul>

          <h1 className="ion-padding-top">Reporting</h1>

          <p>
            <IonLabel>Yet not exhaustive but effective reporting.</IonLabel>
          </p>

          <ul className={styles.list}>
            <li>
              <span aria-label="checkmark" role="img">
                ✅
              </span>{' '}
              Weekly work summary
            </li>
            <li>
              <span aria-label="checkmark" role="img">
                ✅
              </span>{' '}
              Daily list of entries
            </li>
            <li>
              <span aria-label="checkmark" role="img">
                ✅
              </span>{' '}
              Export open invoices to XLSX timesheets for Excel, LibreOffice, Numbers, etc.
            </li>
          </ul>

          <h1 className="ion-padding-top">Open Source</h1>

          <p>
            <IonLabel>
              Tie Tracker is open source and published under the AGPL v3 (or later) licence. Its code is available on{' '}
              <a href="http://github.com/peterpeterparker/tietracker" target="_blank" rel="noopener noreferrer" className={styles.github}>
                GitHub <IonIcon md={logoGithub} ios={logoGithub} area-label="Github"></IonIcon>
              </a>
              .
            </IonLabel>
          </p>

          <h1 className="ion-padding-top">Author</h1>

          <p>
            <IonLabel>
              I, David Dal Busco, am the developer behind this application. I am a freelancer, web developer Web, PWA and Mobile iOS/Android, UX and IT
              consultant by day and the creator of{' '}
              <a href="https://deckdeckgo.com" target="_blank" rel="noopener noreferrer">
                DeckDeckGo
              </a>{' '}
              by night.
            </IonLabel>
          </p>

          <p className="ion-padding-top">
            <IonLabel>
              This app is developed with{' '}
              <a href="https://ionicframework.com" target="_blank" rel="noopener noreferrer">
                Ionic
              </a>
              ,{' '}
              <a href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
                React
              </a>
              ,{' '}
              <a href="https://react-redux.js.org" target="_blank" rel="noopener noreferrer">
                Redux
              </a>
              , Web Workers and other cool stuffs.
            </IonLabel>
          </p>

          <p className="ion-padding-top">
            <IonLabel>To contact me, find some of my blog posts, browse other works or maybe even to hire me, checkout the following links.</IonLabel>
          </p>

          <p className="ion-padding-top">
            <IonLabel>
              To infinity and beyond{' '}
              <span role="img" aria-label="rocket">
                🚀
              </span>
            </IonLabel>
          </p>

          <p>
            <IonLabel>David</IonLabel>
          </p>

          <div className={styles.social}>
            <a href="https://daviddalbusco.com" target="_blank" rel="noopener noreferrer">
              <IonIcon icon={globe} area-label="Personal blog and website"></IonIcon>
            </a>

            <a href="https://twitter.com/daviddalbusco" target="_blank" rel="noopener noreferrer">
              <IonIcon md={logoTwitter} ios={logoTwitter} area-label="Twitter"></IonIcon>
            </a>

            <a href="https://dev.to/daviddalbusco" target="_blank" rel="noopener noreferrer">
              <IonIcon src="./assets/icon/dev.svg" area-label="Dev"></IonIcon>
            </a>

            <a href="https://medium.com/@david.dalbusco" target="_blank" rel="noopener noreferrer">
              <IonIcon src="./assets/icon/medium.svg" area-label="Medium"></IonIcon>
            </a>

            <a href="http://github.com/peterpeterparker" target="_blank" rel="noopener noreferrer">
              <IonIcon md={logoGithub} ios={logoGithub} area-label="Github"></IonIcon>
            </a>
          </div>

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
