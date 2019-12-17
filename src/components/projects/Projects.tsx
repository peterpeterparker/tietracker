import React from 'react';
import { useSelector } from 'react-redux';

import { IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonIcon, IonRippleEffect } from '@ionic/react';

import { Project } from '../../models/project';
import { RootState } from '../../store/reducers';

import styles from './Projects.module.scss';

import { playCircle } from 'ionicons/icons';

const Projects: React.FC = () => {

    const projects: Project[] = useSelector((state: RootState) => state.activeProjects.projects);

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
            {
                projects.map((project: Project) => {
                    return <IonCard key={project.id} onClick={() => console.log('click')} className="ion-activatable ion-margin-bottom">
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

export default Projects;