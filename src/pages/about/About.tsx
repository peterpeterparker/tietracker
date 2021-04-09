import React from 'react';
import {Link} from 'react-router-dom';
import {IonContent, IonPage, IonLabel, IonIcon, IonHeader, IonToolbar} from '@ionic/react';

import Header from '../../components/header/Header';

import styles from './About.module.scss';

import {logoTwitter, logoGithub, globeOutline, checkmark} from 'ionicons/icons';

const About: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
        <Header></Header>

        <main className="ion-padding">
          <IonHeader>
            <IonToolbar className="title">
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
            </IonToolbar>
          </IonHeader>

          <p>
            <IonLabel>Tie Tracker is meant to be simple and aims to allow you to track working hours across projects.</IonLabel>
          </p>

          <h1 className="ion-padding-top">Features</h1>

          <p>
            <IonLabel>Track your productivity and billable hours.</IonLabel>
          </p>

          <ul className={styles.list}>
            <li>
              <IonIcon icon={checkmark} className={styles.icon} /> Simple work hours tracking
            </li>
            <li>
              <IonIcon icon={checkmark} className={styles.icon} /> Assign time to clients and projects
            </li>
            <li>
              <IonIcon icon={checkmark} className={styles.icon} /> Define budget per projects
            </li>
            <li>
              <IonIcon icon={checkmark} className={styles.icon} /> Mark entries as charges
            </li>
          </ul>

          <h1 className="ion-padding-top">Reporting</h1>

          <p>
            <IonLabel>Yet not exhaustive but effective reporting.</IonLabel>
          </p>

          <ul className={styles.list}>
            <li>
              <IonIcon icon={checkmark} className={styles.icon} /> Weekly work summary
            </li>
            <li>
              <IonIcon icon={checkmark} className={styles.icon} /> Daily list of entries
            </li>
            <li>
              <IonIcon icon={checkmark} className={styles.icon} /> Export open invoices to XLSX timesheets (Excel, LibreOffice, Numbers, etc) and PDF
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

          <h1 className="ion-padding-top">Technical Stack</h1>

          <p>
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

          <h1 className="ion-padding-top">Data</h1>

          <p>
            <IonLabel>It works offline, data are saved on your device. No analytics nor tracking are implemented.</IonLabel>
          </p>

          <h1 className="ion-padding-top">Contact</h1>

          <p>
            <IonLabel>
              Got a question or, a project which requires a freelance web developer? Reach me out on{' '}
              <a href="https://twitter.com/daviddalbusco" target="_blank" rel="noopener noreferrer">
                Twitter
              </a>{' '}
              or{' '}
              <a href="https://daviddalbusco.com" target="_blank" rel="noopener noreferrer">
                website
              </a>
              .
            </IonLabel>
          </p>

          <div className={styles.social}>
            <a href="https://daviddalbusco.com" target="_blank" rel="noopener noreferrer">
              <IonIcon icon={globeOutline} area-label="Personal blog and website"></IonIcon>
            </a>

            <a href="https://twitter.com/daviddalbusco" target="_blank" rel="noopener noreferrer">
              <IonIcon md={logoTwitter} ios={logoTwitter} area-label="Twitter"></IonIcon>
            </a>

            <a href="http://github.com/peterpeterparker" target="_blank" rel="noopener noreferrer">
              <IonIcon md={logoGithub} ios={logoGithub} area-label="Github"></IonIcon>
            </a>

            <a href="https://dev.to/daviddalbusco" target="_blank" rel="noopener noreferrer">
              <IonIcon src="./assets/icon/dev.svg" area-label="Dev"></IonIcon>
            </a>

            <a href="https://medium.com/@david.dalbusco" target="_blank" rel="noopener noreferrer">
              <IonIcon src="./assets/icon/medium.svg" area-label="Medium"></IonIcon>
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
