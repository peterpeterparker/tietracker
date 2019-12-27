import React, {FormEvent, RefObject, createRef, CSSProperties} from 'react';
import {
    IonHeader,
    IonContent,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonCheckbox
} from '@ionic/react';

import {more} from 'ionicons/icons';

import styles from './CreateClientModal.module.scss';

import {Client, ClientData} from '../../models/client';
import {RootProps, rootConnector} from '../../store/thunks/index.thunks';
import {ProjectData} from '../../models/project';

import {contrast} from '../../utils/utils.color';

type ClientState = {
    clientData?: ClientData;
    projectData?: ProjectData;
    valid: {
        client: boolean,
        project: boolean
    }
}

interface Props extends RootProps {
    closeAction: Function
}

class CreateClientModal extends React.Component<Props, ClientState> {

    private clientNameRef: RefObject<any> = createRef();
    private clientColorRef: RefObject<any> = createRef();
    private projectNameRef: RefObject<any> = createRef();
    private projectRateRef: RefObject<any> = createRef();

    constructor(props: Props) {
        super(props);

        this.state = {
            valid: {
                client: false,
                project: false
            }
        };
    }

    componentDidMount() {
        this.clientColorRef.current.addEventListener('colorChange', this.selectColor, false);
    }

    componentWillUnmount() {
        this.clientColorRef.current.removeEventListener('colorChange', this.selectColor, true);
    }

    private handleClientNameInput($event: CustomEvent<KeyboardEvent>) {
        let data: ClientData;

        if (this.state.clientData) {
            data = {...this.state.clientData};
            data.name = ($event.target as InputTargetEvent).value;
        } else {
            data = {
                name: ($event.target as InputTargetEvent).value
            };
        }

        this.setState({clientData: data});
    }

    private validateClientName() {
        const valid = {...this.state.valid};
        valid.client = this.state.clientData !== undefined && this.state.clientData.name !== undefined && this.state.clientData.name.length >= 3;
        this.setState({valid});
    }

    private selectColor = ($event: CustomEvent) => {
        if (!this.state.clientData) {
            return;
        }

        const data: ClientData = {...this.state.clientData};
        data.color = $event.detail.hex;
        this.setState({clientData: data});
    };

    private handleProjectNameInput($event: CustomEvent<KeyboardEvent>) {
        if (!this.state.clientData) {
            return;
        }

        let data: ProjectData;

        if (this.state.projectData) {
            data = {...this.state.projectData};
            data.name = ($event.target as InputTargetEvent).value;
        } else {
            data = {
                name: ($event.target as InputTargetEvent).value,
                disabled: false,
                rate: {
                    hourly: 0,
                    vat: this.props.settings.vat !== undefined
                }
            };
        }

        this.setState({projectData: data});
    }

    private handleProjectRateInput($event: CustomEvent<KeyboardEvent>) {
        if (!this.state.clientData) {
            return;
        }

        let data: ProjectData;

        if (this.state.projectData) {
            data = {...this.state.projectData};
            data.rate.hourly = parseInt(($event.target as InputTargetEvent).value);
        } else {
            data = {
                name: '',
                disabled: false,
                rate: {
                    hourly: parseInt(($event.target as InputTargetEvent).value),
                    vat: this.props.settings.vat !== undefined
                }
            };
        }

        this.setState({projectData: data});
    }

    private validateProject() {
        const valid = {...this.state.valid};
        valid.project = this.state.projectData !== undefined && this.state.projectData.name !== undefined && this.state.projectData.name.length >= 3 && this.state.projectData.rate && this.state.projectData.rate.hourly >= 0;
        this.setState({valid});
    }

    private async handleSubmit($event: FormEvent<HTMLFormElement>) {
        $event.preventDefault();

        if (this.state.clientData === undefined || this.state.projectData === undefined) {
            return;
        }

        try {
            const persistedClient: Client = await this.props.createClient(this.state.clientData);

            if (!persistedClient || persistedClient === undefined || !persistedClient.id || persistedClient.id === undefined) {
                // TODO: Error management
                // And what if client withtout project? duplicated? -> delete whatever function
                console.error('Client not created');
                return;
            }

            await this.props.createProject(persistedClient, this.state.projectData);

            await this.props.closeAction();

            this.reset();
        } catch (err) {
            console.error(err);
        }
    }

    private reset() {
        // Reset state
        this.setState({
            valid: {
                client: false,
                project: false
            },
            clientData: undefined,
            projectData: undefined
        });

        this.clientNameRef.current.value = undefined;
        this.clientColorRef.current.value = undefined;
        this.projectNameRef.current.value = undefined;
        this.projectRateRef.current.value = undefined;
    }

    private onVatChange($event: CustomEvent) {
        if (!$event || !$event.detail) {
            return;
        }

        if (!this.state.clientData) {
            return;
        }

        let data: ProjectData;

        if (this.state.projectData) {
            data = {...this.state.projectData};
            data.rate.vat = $event.detail.checked;
        } else {
            data = {
                name: '',
                disabled: false,
                rate: {
                    hourly: 0,
                    vat: $event.detail.checked
                }
            };
        }

        this.setState({projectData: data});
    }

    render() {
        const valid: boolean = this.state.valid.client && this.state.valid.project;

        const color: string | undefined = this.state.clientData ? this.state.clientData.color : undefined;
        const colorContrast: string = contrast(color);

        return <IonContent>
            <IonHeader>
                <IonToolbar style={{'--background': color, '--color': colorContrast} as CSSProperties}>
                    <IonTitle>Add a new client</IonTitle>
                    <IonButtons slot="start">
                        <IonButton onClick={() => this.props.closeAction()}>
                            <IonIcon name="close" slot="icon-only"></IonIcon>
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <main className="ion-padding">
                <form onSubmit={($event: FormEvent<HTMLFormElement>) => this.handleSubmit($event)}>
                    <IonList className="inputs-list">
                        <IonItem className="item-title">
                            <IonLabel>Client</IonLabel>
                        </IonItem>
                        <IonItem>
                            <IonInput ref={this.clientNameRef} debounce={500} minlength={3} maxlength={32}
                                      required={true} input-mode="text"
                                      onIonInput={($event: CustomEvent<KeyboardEvent>) => this.handleClientNameInput($event)}
                                      onIonChange={() => this.validateClientName()}>
                            </IonInput>
                        </IonItem>

                        <IonItem disabled={!this.state.valid.client} className="item-title ion-margin-top">
                            <IonLabel>Color</IonLabel>
                        </IonItem>

                        <div className={styles.color + ` ${!this.state.valid.client ? 'disabled' : ''}`}>
                            <deckgo-color ref={this.clientColorRef}
                                          className="ion-padding-start ion-padding-end ion-padding-bottom"
                                          more={true}>
                                <IonIcon icon={more} slot="more" aria-label="More" class="more"></IonIcon>
                            </deckgo-color>
                        </div>

                        <IonItem disabled={!this.state.valid.client} className="item-title ion-margin-top">
                            <IonLabel>Project</IonLabel>
                        </IonItem>
                        <IonItem disabled={!this.state.valid.client}>
                            <IonInput ref={this.projectNameRef} debounce={500} minlength={3} maxlength={32}
                                      required={true} input-mode="text"
                                      onIonInput={($event: CustomEvent<KeyboardEvent>) => this.handleProjectNameInput($event)}
                                      onIonChange={() => this.validateProject()}>
                            </IonInput>
                        </IonItem>

                        <IonItem disabled={!this.state.valid.client} className="item-title">
                            <IonLabel>Hourly rate</IonLabel>
                        </IonItem>
                        <IonItem disabled={!this.state.valid.client}>
                            <IonInput ref={this.projectRateRef} debounce={500} minlength={1} required={true}
                                      input-mode="text"
                                      onIonInput={($event: CustomEvent<KeyboardEvent>) => this.handleProjectRateInput($event)}
                                      onIonChange={() => this.validateProject()}>
                            </IonInput>
                        </IonItem>

                        {this.renderVat(color)}
                    </IonList>

                    <IonButton type="submit" className="ion-margin-top" disabled={!valid} style={{'--background': color, '--color': colorContrast, '--background-hover': color, '--color-hover': colorContrast, '--background-activated': colorContrast, '--color-activated': color} as CSSProperties}>
                        <IonLabel>Submit</IonLabel>
                    </IonButton>
                </form>
            </main>
        </IonContent>
    };

    private renderVat(color: string | undefined) {
        if (!this.props.settings.vat || this.props.settings.vat === undefined) {
            return undefined;
        }

        return <>
            <IonItem disabled={!this.state.valid.client} className="item-title">
                <IonLabel>Vat</IonLabel>
            </IonItem>
            <IonItem disabled={!this.state.valid.client} className="item-checkbox">
                <IonLabel>{this.props.settings.vat}%</IonLabel>
                <IonCheckbox slot="end" style={{'--background-checked': color, '--border-color-checked': color} as CSSProperties}
                             checked={this.state.projectData ? this.state.projectData.rate.vat : false}
                             onIonChange={($event: CustomEvent) => this.onVatChange($event)}></IonCheckbox>
            </IonItem>
        </>
    }

}

export default rootConnector(CreateClientModal);
