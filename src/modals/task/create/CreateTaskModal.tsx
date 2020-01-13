import React, {CSSProperties, FormEvent, useState} from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon, IonItem,
    IonLabel,
    IonList, IonSelect, IonSelectOption,
    IonTitle,
    IonToolbar
} from '@ionic/react';

import {useTranslation} from 'react-i18next';

import styles from './CreateTaskModal.module.scss';

import {contrast} from '../../../utils/utils.color';

import {rootConnector, RootProps} from '../../../store/thunks/index.thunks';

import {Project} from '../../../models/project';

import {ThemeService} from '../../../services/theme/theme.service';
import {useSelector} from 'react-redux';
import {RootState} from '../../../store/reducers';


interface Props extends RootProps {
    closeAction: Function;
}

const CreateTaskModal: React.FC<Props> = (props: Props) => {

    const {t} = useTranslation(['tasks', 'common']);

    const [project, setProject] = useState<Project | undefined>(undefined);

    const projects: Project[] | undefined = useSelector((state: RootState) => state.activeProjects.projects);

    async function handleSubmit($event: FormEvent<HTMLFormElement>) {
        $event.preventDefault();
    }

    function onProjectChange($event: CustomEvent) {
        if (!$event || !$event.detail) {
            return;
        }

        setProject($event.detail.value);
    }

    return renderContent();

    function renderContent() {

        const color: string | undefined = project && project.data && project.data.client ? project.data.client.color : undefined;
        const colorContrast: string = contrast(color, 128, ThemeService.getInstance().isDark());

        return <IonContent>
            <IonHeader>
                <IonToolbar style={{
                    '--background': color,
                    '--color': colorContrast,
                    '--ion-toolbar-color': colorContrast
                } as CSSProperties}>
                    <IonTitle>{t('tasks:create.title')}</IonTitle>
                    <IonButtons slot="start">
                        <IonButton onClick={() => props.closeAction()}>
                            <IonIcon name="close" slot="icon-only"></IonIcon>
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <main className="ion-padding">
                {renderForm()}
            </main>
        </IonContent>
    }

    function renderForm() {
        if (!projects || projects === undefined || projects.length <= 0) {
            return undefined;
        }

        return <form onSubmit={($event: FormEvent<HTMLFormElement>) => handleSubmit($event)}>
            <IonList className="inputs-list">
                {renderProjects()}
            </IonList>
        </form>
    }

    function renderProjects() {
        return <>
            <IonItem className="item-title">
                <IonLabel>{t('tasks:create.project')}</IonLabel>
            </IonItem>

            <IonItem className="item-input">
                <IonSelect interfaceOptions={{header: t('tasks:create.project')}}
                           placeholder={t('tasks:create.project')}
                           value={project}
                           onIonChange={($event: CustomEvent) => onProjectChange($event)}>
                    {renderProjectOptions()}
                </IonSelect>
            </IonItem>
        </>
    }

    function renderProjectOptions() {
        if (!projects || projects === undefined || projects.length <= 0) {
            return undefined;
        }

        return projects.map((project) => {
            let client: string = project.data && project.data.client ? `${project.data.client.name} - ` : '';

            return <IonSelectOption value={project} key={project.id}>{client + project.data.name}</IonSelectOption>
        });
    }

};

export default rootConnector(CreateTaskModal);
