import React from 'react';
import {useSelector} from 'react-redux';

import {play} from 'ionicons/icons';

import {IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonIcon, IonRippleEffect, IonLabel} from '@ionic/react';

import styles from './Projects.module.scss';

import {Project} from '../../models/project';
import {Task} from '../../models/task';

import {RootState} from '../../store/reducers';
import {rootConnector, RootProps} from '../../store/thunks/index.thunks';
import {Settings as SettingsModel} from '../../models/settings';
import {contrast} from '../../utils/utils.color';
import {useTranslation} from 'react-i18next';

interface Props extends RootProps {
  addAction: Function;
}

const Projects: React.FC<Props> = (props: Props) => {
  const {t} = useTranslation('projects');

  const projects: Project[] | undefined = useSelector((state: RootState) => state.activeProjects.projects);
  const task: Task | undefined = useSelector((state: RootState) => state.tasks.taskInProgress);
  const settings: SettingsModel = useSelector((state: RootState) => state.settings.settings);

  async function startStopTask(project: Project) {
    // TODO catch error
    if (task && task !== undefined) {
      await props.stopTask(0, settings.roundTime);
    } else {
      await props.startTask(project, settings);
    }
  }

  return (
    <div>
      <h1 className={!projects || projects.length <= 0 ? undefined : styles.title}>{t('projects.title')}</h1>
      {renderProjects()}
    </div>
  );

  function renderProjects() {
    if (!projects || projects.length <= 0) {
      return renderDummyProject();
    }

    return (
      <div className={styles.projects}>
        <div>
          {projects.map((project: Project) => {
            const colorContrast: string = contrast(project.data.client ? project.data.client.color : undefined);

            return (
              <IonCard key={project.id} onClick={() => startStopTask(project)} className="ion-activatable ion-margin-bottom client" color="card">
                <div
                  style={{
                    background: project.data.client ? project.data.client.color : undefined,
                    color: colorContrast,
                  }}>
                  <IonLabel>Start</IonLabel>
                  <IonIcon icon={play} />
                </div>
                <IonCardHeader>
                  <IonCardSubtitle>{project.data.client ? project.data.client.name : ''}</IonCardSubtitle>
                  <IonCardTitle>{project.data.name}</IonCardTitle>
                </IonCardHeader>
                <IonRippleEffect></IonRippleEffect>
              </IonCard>
            );
          })}
        </div>
      </div>
    );
  }

  function renderDummyProject() {
    return <IonLabel className="placeholder">{t('projects.empty')}</IonLabel>;
  }
};

export default rootConnector(Projects);
