import React from 'react';
import {IonContent, IonPage, IonLabel, IonIcon} from '@ionic/react';

import Header from '../../components/header/Header';

import styles from './About.module.scss';

import { logoTwitter, globe, logoGithub } from 'ionicons/icons';

const About: React.FC = () => {

    return (
        <IonPage>
            <IonContent>
                <Header></Header>

                <main className="ion-padding">
                    <div className={styles.intro}>
                        <img src="assets/icon/logo.svg" alt="Tie Tracker logo" height="160"/>

                        <p><IonLabel><strong>Tie Tracker</strong> - A simple, open source and free time tracking app ⏱️</IonLabel></p>
                    </div>

                    <p><IonLabel>Tie Tracker is a free and open source time tracking application. Its usage is meant to be simple and has the goal to lets you track work hours across projects.</IonLabel></p>

                    <h1 className="ion-padding-top">Features</h1>

                    <p><IonLabel>Track your productivity and billable hours.</IonLabel></p>

                    <ul className={styles.list}>
                        <li>✅ Simple work hours tracking</li>
                        <li>✅ Assign time to clients and projects</li>
                        <li>✅ Mark entries as billed</li>
                    </ul>

                    <h1 className="ion-padding-top">Reporting</h1>

                    <p><IonLabel>Yet not complicated but effective reporting.</IonLabel></p>

                    <ul className={styles.list}>
                        <li>✅ Weekly work summary</li>
                        <li>✅ Today's list of activities</li>
                        <li>✅ Export open invoices to CSV timesheets</li>
                    </ul>

                    <h1 className="ion-padding-top">Open Source</h1>

                    <p><IonLabel>Tie Tracker is open source and published under the AGPL v3 (or later) licence. Its code is available on <a href="http://github.com/peterpeterparker/tietracker" target="_blank" className={styles.github}><IonIcon icon={logoGithub} area-label="Github"></IonIcon> GitHub</a>.</IonLabel></p>

                    <h1 className="ion-padding-top">Author</h1>

                    <p><IonLabel>I, David Dal Busco, am the developer behind this application. I am a freelancer, full stack developer Web, PWA and Mobile iOS/Android, UX and IT consultant by day and the creator of <a href="https://deckdeckgo.com" target="_black">DeckDeckGo</a> by night.</IonLabel></p>

                    <p className="ion-padding-top"><IonLabel>This app is developed with <a href="https://ionicframework.com" target="_blank">Ionic</a>, <a href="https://reactjs.org" target="_blank">React</a>, <a href="https://react-redux.js.org" target="_blank">Redux</a>, Web Workers and other cool stuffs.</IonLabel></p>

                    <p className="ion-padding-top"><IonLabel>To contact me, find some of my blog posts, browse other works or maybe even to hire me, follow these links.</IonLabel></p>

                    <div className={styles.social}>
                        <a href="https://twitter.com/daviddalbusco" target="_blank">
                            <IonIcon icon={logoTwitter} area-label="Twitter"></IonIcon>
                        </a>

                        <a href="https://daviddalbusco.com" target="_blank">
                            <IonIcon icon={globe} area-label="Personal blog and website"></IonIcon>
                        </a>

                        <a href="https://dev.to/daviddalbusco" target="_blank">
                            <IonIcon src="./assets/icon/dev.svg" area-label="Dev"></IonIcon>
                        </a>

                        <a href="https://medium.com/@david.dalbusco" target="_blank">
                            <IonIcon src="./assets/icon/medium.svg" area-label="Medium"></IonIcon>
                        </a>

                        <a href="http://github.com/peterpeterparker" target="_blank">
                            <IonIcon icon={logoGithub} area-label="Github"></IonIcon>
                        </a>
                    </div>

                    <p className="ion-padding-top"><IonLabel>To infinity and beyond 🚀</IonLabel></p>

                    <p><IonLabel>David</IonLabel></p>
                </main>
            </IonContent>
        </IonPage>
    );

};

export default About;
