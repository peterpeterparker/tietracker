import React, {CSSProperties, FormEvent, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem, IonLabel,
    IonList,
    IonTitle,
    IonToolbar
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

import {ThemeService} from '../../services/theme/theme.service';
import {InvoicesPeriod, InvoicesService} from '../../services/invoices/invoices.services';

interface Props extends RootProps {
    closeAction: Function;
    invoice: Invoice | undefined;
}

const InvoiceModal: React.FC<Props> = (props) => {

    const settings: Settings = useSelector((state: RootState) => state.settings.settings);

    const [from, setFrom] = useState<Date | undefined>(undefined);
    const [to, setTo] = useState<Date | undefined>(undefined);

    const color: string | undefined = props.invoice !== undefined && props.invoice.client ? props.invoice.client.color : undefined;
    const colorContrast: string = contrast(color, 128, ThemeService.getInstance().isDark());

    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>(undefined);

    useEffect(() => {
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.invoice]);

    async function init() {
        if (props.invoice) {
            const period: InvoicesPeriod | undefined = await InvoicesService.getInstance().period();

            setFrom(period ? period.from : undefined);
            setTo(period ? period.to : undefined);

            setSelectedInvoice({...props.invoice});
        } else {
            setFrom(undefined);
            setTo(undefined);
            setSelectedInvoice(undefined);
        }
    }

    async function handleSubmit($event: FormEvent<HTMLFormElement>) {
        $event.preventDefault();
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

        if (selectedInvoice === undefined) {
            return <p>For the selected period nothing can be billed.</p>
        }

        return <p>For the selected period <strong>{formatCurrency(selectedInvoice.billable, settings.currency)}</strong> can be billed.</p>
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
            </IonList>
        </form>
    }

};

export default rootConnector(InvoiceModal);
