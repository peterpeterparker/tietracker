import React, {CSSProperties, FormEvent, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {
    IonButton,
    IonButtons, IonCheckbox,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem, IonLabel,
    IonList,
    IonTitle,
    IonToolbar, isPlatform
} from '@ionic/react';

import DateFnsUtils from '@date-io/date-fns';
import {MaterialUiPickersDate} from '@material-ui/pickers/typings/date';
import {DatePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';

import {rootConnector, RootProps} from '../../store/thunks/index.thunks';
import {Invoice} from '../../store/interfaces/invoice';
import {RootState} from '../../store/reducers';

import {Settings} from '../../models/settings';

import {contrast} from '../../utils/utils.color';
import {formatCurrency} from '../../utils/utils.currency';
import {pickerColor} from '../../utils/utils.picker';
import {isChrome, isHttps} from '../../utils/utils.platform';

import {ThemeService} from '../../services/theme/theme.service';
import {InvoicesPeriod, InvoicesService} from '../../services/invoices/invoices.service';
import {ExportService} from '../../services/export/export.service';

interface Props extends RootProps {
    closeAction: Function;
    invoice: Invoice | undefined;
}

const InvoiceModal: React.FC<Props> = (props) => {

    const settings: Settings = useSelector((state: RootState) => state.settings.settings);

    const [from, setFrom] = useState<Date | undefined>(undefined);
    const [to, setTo] = useState<Date | undefined>(undefined);
    const [bill, setBill] = useState<boolean>(false);

    const color: string | undefined = props.invoice !== undefined && props.invoice.client ? props.invoice.client.color : undefined;
    const colorContrast: string = contrast(color, 128, ThemeService.getInstance().isDark());

    const [billable, setBillable] = useState<number | undefined>(undefined);

    const [inProgress, setInProgress] = useState<boolean>(false);

    useEffect(() => {
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.invoice]);

    useEffect(() => {
        updateBillable();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [from, to]);

    async function init() {
        if (props.invoice) {
            const period: InvoicesPeriod | undefined = await InvoicesService.getInstance().period();

            setFrom(period ? period.from : undefined);
            setTo(period ? period.to : undefined);

            setBillable(props.invoice ? props.invoice.billable : undefined);
        } else {
            setFrom(undefined);
            setTo(undefined);
            setBillable(undefined);
        }
    }

    async function handleSubmit($event: FormEvent<HTMLFormElement>) {
        $event.preventDefault();

        if (!props.invoice) {
            return;
        }

        setInProgress(true);

        if (isPlatform('desktop') && isChrome() && isHttps()) {
            await ExportService.getInstance().exportNativeFileSystem(props.invoice, from, to, settings.currency, bill);
        } else if (isPlatform('hybrid')) {
            await ExportService.getInstance().exportMobileFileSystem(props.invoice, from, to, settings.currency, bill);
        } else  {
            await ExportService.getInstance().exportDownload(props.invoice, from, to, settings.currency, bill);
        }

        if (bill) {
            setTimeout(async () => {
                await props.listProjectsInvoices();

                props.closeAction();

                setInProgress(false);
            }, 1500);
        } else {
            setInProgress(false);
        }
    }

    async function updateBillable() {
        if (!props.invoice) {
            return;
        }

        if (from === undefined || to === undefined) {
            return;
        }

        await InvoicesService.getInstance().listProjectInvoice((data: Invoice) => {
            setBillable(data !== undefined ? data.billable : undefined);
        }, props.invoice.project_id, from, to);
    }

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            {renderContent()}
        </MuiPickersUtilsProvider>
    );

    function renderContent() {
        pickerColor(colorContrast, color);

        return <IonContent>
            <IonHeader>
                <IonToolbar style={{'--background': color, '--color': colorContrast} as CSSProperties}>
                    <IonTitle>{props.invoice !== undefined && props.invoice.client && props.invoice.client.name !== undefined ? props.invoice.client.name : ''}</IonTitle>
                    <IonButtons slot="start">
                        <IonButton onClick={() => props.closeAction()}>
                            <IonIcon name="close" slot="icon-only"></IonIcon>
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <main className="ion-padding">
                {renderBillable()}
                {renderFilter()}
            </main>
        </IonContent>
    }

    function renderBillable() {
        if (from === undefined || to === undefined) {
            return <p>No period defined.</p>
        }

        if (billable === undefined) {
            return <p>For the selected period nothing can be billed.</p>
        }

        return <p>For the selected period <strong>{formatCurrency(billable, settings.currency)}</strong> can be billed.</p>
    }

    function renderFilter() {
        return <form onSubmit={($event: FormEvent<HTMLFormElement>) => handleSubmit($event)}>
            <IonList className="inputs-list">
                <IonItem className="item-title">
                    <IonLabel>From</IonLabel>
                </IonItem>

                <IonItem className="item-input">
                    <DatePicker DialogProps={{disableEnforceFocus: true}} value={from} onChange={(date: MaterialUiPickersDate) => setFrom(date as Date)}
                                    format="yyyy/MM/dd"/>
                </IonItem>

                <IonItem className="item-title">
                    <IonLabel>To</IonLabel>
                </IonItem>

                <IonItem className="item-input">
                    <DatePicker DialogProps={{disableEnforceFocus: true}} value={to} onChange={(date: MaterialUiPickersDate) => setTo(date as Date)}
                                    format="yyyy/MM/dd"/>
                </IonItem>

                <IonItem className="item-title">
                    <IonLabel>Close invoice</IonLabel>
                </IonItem>

                <IonItem className="item-checkbox">
                    <IonLabel>Set tasks as billed</IonLabel>
                    <IonCheckbox slot="end" style={{'--background-checked': color, '--border-color-checked': color} as CSSProperties}
                                 checked={bill}
                                 onIonChange={($event: CustomEvent) => setBill($event.detail.checked)}></IonCheckbox>
                </IonItem>
            </IonList>

            <IonButton type="submit" className="ion-margin-top" disabled={billable === undefined || inProgress} style={{'--background': color, '--color': colorContrast, '--background-hover': color, '--color-hover': colorContrast, '--background-activated': colorContrast, '--color-activated': color} as CSSProperties}>
                <IonLabel>{inProgress ? "Wait for it..." : "Export"}</IonLabel>
            </IonButton>
        </form>
    }

};

export default rootConnector(InvoiceModal);
