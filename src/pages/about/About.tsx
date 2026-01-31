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
import React from 'react';
import {Link} from 'react-router-dom';

import styles from './About.module.scss';

import {checkmark, chevronBackOutline, globeOutline, logoGithub, logoTwitter} from 'ionicons/icons';

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

          <h1>Features</h1>

          <p>
            <IonLabel>Track your productivity and billable hours.</IonLabel>
          </p>

          <ul className={styles.list}>
            <li>
              <IonIcon icon={checkmark} className={styles.icon} /> Simple work hours tracking
            </li>
            <li>
              <IonIcon icon={checkmark} className={styles.icon} /> Assign time to clients and
              projects
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
              <IonIcon icon={checkmark} className={styles.icon} /> Export open invoices to XLSX
              timesheets (Excel, LibreOffice, Numbers, etc) and PDF
            </li>
          </ul>

          <h1 className="ion-padding-top">Open Source</h1>

          <p>
            <IonLabel>
              Tie Tracker is open source and published under the AGPL v3 (or later) licence. Its
              code is available on{' '}
              <a
                href="http://github.com/peterpeterparker/tietracker"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.github}>
                GitHub <IonIcon md={logoGithub} ios={logoGithub} area-label="Github"></IonIcon>
              </a>
              .
            </IonLabel>
          </p>

          <h1 className="ion-padding-top">Data</h1>

          <p>
            <IonLabel>
              It works offline, data are saved on your device. No analytics nor tracking are
              implemented.
            </IonLabel>
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
