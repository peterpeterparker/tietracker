import React from 'react';
import { useSelector } from 'react-redux';

import { playCircle } from 'ionicons/icons';

import { IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonIcon, IonRippleEffect } from '@ionic/react';

import styles from './Projects.module.scss';

import { Project } from '../../models/project';
import { Task } from '../../models/task';

import { RootState } from '../../store/reducers';
import { rootConnector, RootProps } from '../../store/thunks/index.thunks';
import {Settings as SettingsModel} from '../../models/settings';

interface Props extends RootProps {
    addAction: Function;
}

const Projects: React.FC<Props> = (props: Props) => {

    const projects: Project[] = useSelector((state: RootState) => state.activeProjects.projects);
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
        <div className="ion-padding-top">
            <h1 className={styles.title}>Projects</h1>
            {renderProjects()}
        </div>
    );

    function renderProjects() {
        if (!projects || projects.length <= 0) {
            return renderDummyProject();
        }

        return <div className={styles.projects}>
            <div>
                {
                    projects.map((project: Project) => {
                        return <IonCard key={project.id} onClick={() => startStopTask(project)} className="ion-activatable ion-margin-bottom client" color="card">
                            <div style={{ background: project.data.client ? project.data.client.color : undefined }}>
                                <IonIcon icon={playCircle} />
                            </div>
                            <IonCardHeader>
                                <IonCardSubtitle>{project.data.client ? project.data.client.name : ''}</IonCardSubtitle>
                                <IonCardTitle>{project.data.name}</IonCardTitle>
                            </IonCardHeader>
                            <IonRippleEffect></IonRippleEffect>
                        </IonCard>
                    })
                }
            </div>
        </div>
    }

    function renderDummyProject() {
        return <div className={styles.projects}>
            <IonCard onClick={() => props.addAction()} className="ion-activatable ion-margin-bottom client" color="card">
                <div style={{ background: 'var(--ion-color-secondary)' }}>
                    <IonIcon icon={playCircle} />
                </div>
                <IonCardHeader>
                    <IonCardSubtitle>Start</IonCardSubtitle>
                    <IonCardTitle>Add your first project</IonCardTitle>
                </IonCardHeader>
                <IonRippleEffect></IonRippleEffect>
            </IonCard>
        </div>
    }

};

export default rootConnector(Projects);
