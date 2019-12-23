import React, {CSSProperties, FormEvent, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {rootConnector, RootProps} from '../../store/thunks/index.thunks';

import {Project} from '../../models/project';
import {ProjectsService} from '../../services/projects/projects.service';

import {
    IonButton,
    IonButtons, IonCheckbox,
    IonContent,
    IonHeader,
    IonIcon, IonInput, IonItem, IonLabel,
    IonList,
    IonSpinner,
    IonTitle,
    IonToolbar
} from '@ionic/react';

import styles from '../clients/ClientsModal.module.scss';

import {Settings} from '../../models/settings';

import {RootState} from '../../store/reducers';
import {ClientsService} from '../../services/clients/clients.service';

interface Props extends RootProps {
    closeAction: Function;
    projectId: string;
    color: string | undefined;
    colorContrast: string;
}

const ProjectModal: React.FC<Props> = (props) => {

    const settings: Settings = useSelector((state: RootState) => state.settings.settings);

    const [project, setProject] = useState<Project | undefined>(undefined);

    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);

    const [valid, setValid] = useState<boolean>(true);

    useEffect(() => {
        setLoading(true);

        loadProject();

        setLoading(false);
    }, [props.projectId]);

    async function loadProject() {
        const project: Project | undefined = await ProjectsService.getInstance().find(props.projectId);
        setProject(project);
    }

    function handleClientNameInput($event: CustomEvent<KeyboardEvent>) {
        if (project && project.data) {
            project.data.name = ($event.target as InputTargetEvent).value;
        }
    }

    function handleProjectRateInput($event: CustomEvent<KeyboardEvent>) {
        if (project && project.data && project.data.rate) {
            project.data.rate.hourly = parseInt(($event.target as InputTargetEvent).value);
        }
    }

    function onVatChange($event: CustomEvent) {
        if (project && project.data && project.data.rate) {
            project.data.rate.vat = $event.detail.checked;
        }
    }

    function validateProject() {
        setValid(project !== undefined && project.data !== undefined && project.data.name !== undefined && project.data.name.length >= 3 && project.data.rate && project.data.rate.hourly >= 0);
    }

    async function handleSubmit($event: FormEvent<HTMLFormElement>) {
        $event.preventDefault();

        if (!project || !project.data) {
            return;
        }

        setSaving(true);

        try {
            await ProjectsService.getInstance().update(project);

            props.closeAction();
        } catch (err) {
            // TODO show err
            console.error(err);
        }

        setSaving(false);
    }

    return (
        <>
            <IonHeader>
                <IonToolbar style={{'--background': props.color, '--color': props.colorContrast} as CSSProperties}>
                    <IonTitle>{project && project.data ? project.data.name : ''}</IonTitle>
                    <IonButtons slot="start">
                        <IonButton onClick={() => props.closeAction()}>
                            <IonIcon name="close" slot="icon-only"></IonIcon>
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <main>
                    {renderProject()}
                </main>
            </IonContent>
        </>
    );

    function renderProject() {
        if (loading || !project || !project.data) {
            return <div className="spinner"><IonSpinner color="primary"></IonSpinner></div>
        }

        return <form onSubmit={($event: FormEvent<HTMLFormElement>) => handleSubmit($event)}>
            <IonList className="inputs-list">
                <IonItem className="item-title">
                    <IonLabel>Project</IonLabel>
                </IonItem>
                <IonItem>
                    <IonInput debounce={500} minlength={3} maxlength={32}
                              required={true} input-mode="text" value={project.data.name}
                              onIonInput={($event: CustomEvent<KeyboardEvent>) => handleClientNameInput($event)}
                              onIonChange={() => validateProject()}>
                    </IonInput>
                </IonItem>

                <IonItem disabled={!valid} className="item-title">
                    <IonLabel>Hourly rate</IonLabel>
                </IonItem>
                <IonItem disabled={!valid}>
                    <IonInput debounce={500} minlength={1} required={true}
                              input-mode="text" value={`${project.data.rate ? project.data.rate.hourly : ''}`}
                              onIonInput={($event: CustomEvent<KeyboardEvent>) => handleProjectRateInput($event)}
                              onIonChange={() => validateProject()}>
                    </IonInput>
                </IonItem>

                {renderVat()}
            </IonList>

            <IonButton type="submit" disabled={saving || !valid} aria-label="Update project"
                       className="ion-margin-top" style={{
                '--background': props.color,
                '--color': props.colorContrast,
                '--background-hover': props.color,
                '--color-hover': props.colorContrast,
                '--background-activated': props.colorContrast,
                '--color-activated': props.color
            } as CSSProperties}>
                <IonLabel>Update</IonLabel>
            </IonButton>
        </form>
    }

    function renderVat() {
        if (!settings.vat || settings.vat === undefined) {
            return undefined;
        }

        return <>
            <IonItem disabled={!valid} className="item-title">
                <IonLabel>Vat</IonLabel>
            </IonItem>
            <IonItem disabled={!valid} className="item-checkbox">
                <IonLabel>{settings.vat}%</IonLabel>
                <IonCheckbox slot="end"
                             checked={project && project.data && project.data.rate ? project.data.rate.vat : false}
                             onIonChange={($event: CustomEvent) => onVatChange($event)}></IonCheckbox>
            </IonItem>
        </>
    }
};

export default rootConnector(ProjectModal);
