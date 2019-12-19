import React from 'react';
import { useSelector } from 'react-redux';

import { playCircle } from 'ionicons/icons';

import { IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonIcon, IonRippleEffect } from '@ionic/react';

import styles from './Projects.module.scss';

import { Project } from '../../models/project';
import { Task } from '../../models/task';

import { RootState } from '../../store/reducers';
import { rootConnector, RootProps } from '../../store/thunks/index.thunks';

const Projects: React.FC<RootProps> = (props: RootProps) => {

    const projects: Project[] = useSelector((state: RootState) => state.activeProjects.projects);
    const task: Task | undefined = useSelector((state: RootState) => state.taskInProgress.task);

    async function startStopTask(project: Project) {
        // TODO catch error
        if (task && task !== undefined) {
            await props.stopTask();
        } else {
            await props.startTask(project);
        }
    }

    return (
        <>
            <h1>Projects</h1>
            {renderProjects()}
        </>
    );

    function renderProjects() {
        if (!projects || projects.length <= 0) {
            return renderDummyProject();
        }

        return <div className={styles.projects}>
            <div>
                {
                    projects.map((project: Project) => {
                        return <IonCard key={project.id} onClick={() => startStopTask(project)} className="ion-activatable ion-margin-bottom">
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
            <IonCard className="ion-activatable ion-margin-bottom">
                <div style={{ background: 'var(--ion-color-primary)' }}>
                    <IonIcon icon={playCircle} />
                </div>
                <IonCardHeader>
                    <IonCardSubtitle></IonCardSubtitle>
                    <IonCardTitle>New Client</IonCardTitle>
                </IonCardHeader>
                <IonRippleEffect></IonRippleEffect>
            </IonCard>
        </div>
    }

};

export default rootConnector(Projects);