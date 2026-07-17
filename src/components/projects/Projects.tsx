import {
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonIcon,
  IonLabel,
  IonRippleEffect,
} from '@ionic/react';
import {play} from 'ionicons/icons';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {RootState} from '../../lib/store/reducers';
import {rootConnector, RootProps} from '../../lib/store/thunks/index.thunks';
import {testIds} from '../../lib/tests/test-ids.constants';
import {testId} from '../../lib/tests/test.utils';
import {Project} from '../../lib/types/project';
import {Settings as SettingsModel} from '../../lib/types/settings';
import {Task} from '../../lib/types/task';
import {contrast} from '../../lib/utils/utils.color';
import styles from './Projects.module.scss';

interface Props extends RootProps {
  addAction: () => void;
}

const Projects: React.FC<Props> = (props: Props) => {
  const {t} = useTranslation('projects');

  const projects: Project[] | undefined = useSelector(
    (state: RootState) => state.activeProjects.projects,
  );
  const task: Task | undefined = useSelector((state: RootState) => state.tasks.taskInProgress);
  const settings: SettingsModel = useSelector((state: RootState) => state.settings.settings);

  async function startStopTask(project: Project) {
    // TODO catch error
    if (task && task !== undefined) {
      await props.stopTask({delayDispatch: 0, roundTime: settings.roundTime, settings});
    } else {
      await props.startTask({project, settings});

      await props.updateActiveProject({project, settings});
    }
  }

  return (
    <div>
      <h1 className={!projects || projects.length <= 0 ? undefined : styles.title}>
        {t('projects.title')}
      </h1>
      {renderProjects()}
    </div>
  );

  function renderProjects() {
    if (!projects || projects.length <= 0) {
      return renderDummyProject();
    }

    return (
      <div className={styles.projects} {...testId(testIds.home.projects)}>
        <div>
          {projects.map((project: Project) => {
            const colorContrast = contrast(
              project.data.client ? project.data.client.color : undefined,
            );

            return (
              <IonCard
                key={project.id}
                onClick={() => startStopTask(project)}
                mode="md"
                className="ion-activatable ion-margin-bottom client"
                color="card">
                <div
                  style={{
                    background: project.data.client ? project.data.client.color : undefined,
                    color: colorContrast,
                  }}>
                  <IonLabel>Start</IonLabel>
                  <IonIcon icon={play} />
                </div>
                <IonCardHeader>
                  <IonCardSubtitle>
                    {project.data.client ? project.data.client.name : ''}
                  </IonCardSubtitle>
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
