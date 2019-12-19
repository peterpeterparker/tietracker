import React, { Suspense, useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import { options, home, send } from 'ionicons/icons';

import Home from './pages/home/Home';
import Settings from './pages/settings/Settings';
import Tab3 from './pages/Tab3';
import Details from './pages/Details';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.scss';

import './theme/content.scss';
import './theme/header.scss';

import './helpers/i18n';

import { RootProps, rootConnector } from './store/thunks/index.thunks';

import Task from './components/task/Task';

const App: React.FC<RootProps> = (props: RootProps) => {

  async function initInitialState() {
    const promises = [];
    promises.push(props.initClients());
    promises.push(props.initActiveProjects());
    promises.push(props.initTask());
    promises.push(props.computeSummary());
    promises.push(props.listTasks());

    await Promise.all(promises);
  }

  useEffect(() => {
    initInitialState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Suspense fallback="loading">
      <IonApp>
        <IonReactRouter>
          <IonTabs>
            <IonRouterOutlet>
              <Route path="/home" component={Home} exact={true} />
              <Route path="/settings" component={Settings} exact={true} />
              <Route path="/settings/details" component={Details} />
              <Route path="/tab3" component={Tab3} />
              <Route path="/" render={() => <Redirect to="/home" />} exact={true} />
            </IonRouterOutlet>

            <IonTabBar slot="bottom">
              <IonTabButton tab="home" href="/home">
                <IonIcon icon={home} />
                <IonLabel>Home</IonLabel>
              </IonTabButton>
              <IonTabButton tab="settings" href="/settings">
                <IonIcon icon={options} />
                <IonLabel>Settings</IonLabel>
              </IonTabButton>
              <IonTabButton tab="tab3" href="/tab3">
                <IonIcon icon={send} />
                <IonLabel>Tab Three</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        </IonReactRouter>

        <Task></Task>
      </IonApp>
    </Suspense>
  );
}

export default rootConnector(App);
