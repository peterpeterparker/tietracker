import React, {CSSProperties, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonLoading,
  IonTitle,
  IonToolbar,
  isPlatform,
} from '@ionic/react';

import {close} from 'ionicons/icons';

import {useTranslation} from 'react-i18next';

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
import {budgetRatio} from '../../utils/utils.budget';
import {formatTime} from '../../utils/utils.time';

import {ThemeService} from '../../services/theme/theme.service';
import {InvoicesPeriod, InvoicesService} from '../../services/invoices/invoices.service';
import {ExportService} from '../../services/export/export.service';

interface Props extends RootProps {
  closeAction: Function;
  invoice: Invoice | undefined;
}

interface Billable {
  billable: number;
  hours: number;
}

const InvoiceModal: React.FC<Props> = (props) => {
  const {t} = useTranslation(['invoices', 'common', 'export']);

  const settings: Settings = useSelector((state: RootState) => state.settings.settings);

  const [from, setFrom] = useState<Date | undefined>(undefined);
  const [to, setTo] = useState<Date | undefined>(undefined);
  const [bill, setBill] = useState<boolean>(false);

  const color: string | undefined = props.invoice !== undefined && props.invoice.client ? props.invoice.client.color : undefined;
  const colorContrast: string = contrast(color, 128, ThemeService.getInstance().isDark());

  const [billable, setBillable] = useState<Billable | undefined>(undefined);

  const [inProgress, setInProgress] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      await init();
    })();

    document.addEventListener('ionBackButton', onBackButton);

    return () => document.removeEventListener('ionBackButton', onBackButton);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.invoice]);

  const onBackButton = (ev: Event) => {
    (ev as CustomEvent).detail.register(10, () => {
      props.closeAction();
    });
  };

  useEffect(() => {
    (async () => {
      await updateBillable();
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  async function init() {
    if (props.invoice) {
      const period: InvoicesPeriod | undefined = await InvoicesService.getInstance().period();

      setFrom(period ? period.from : undefined);
      setTo(period ? period.to : undefined);

      setBillable(
        props.invoice
          ? {
              billable: props.invoice.billable,
              hours: props.invoice.hours,
            }
          : undefined
      );
    } else {
      setFrom(undefined);
      setTo(undefined);
      setBillable(undefined);
    }
  }

  async function exportInvoice(type: 'xlsx' | 'pdf') {
    if (!props.invoice) {
      return;
    }

    setInProgress(true);

    try {
      if (isPlatform('desktop') && isChrome() && isHttps()) {
        await ExportService.getInstance().exportNativeFileSystem(props.invoice, from, to, settings.currency, settings.vat, bill, type, settings.signature);
      } else if (isPlatform('hybrid')) {
        await ExportService.getInstance().exportMobileFileSystem(props.invoice, from, to, settings.currency, settings.vat, bill, type, settings.signature);
      } else {
        await ExportService.getInstance().exportDownload(props.invoice, from, to, settings.currency, settings.vat, bill, type, settings.signature);
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
    } catch (err) {
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

    await InvoicesService.getInstance().listProjectInvoice(
      (data: Invoice) => {
        setBillable(
          data !== undefined
            ? {
                billable: data.billable,
                hours: data.hours,
              }
            : undefined
        );
      },
      props.invoice.project_id,
      from,
      to
    );
  }

  return <MuiPickersUtilsProvider utils={DateFnsUtils}>{renderContent()}</MuiPickersUtilsProvider>;

  function renderContent() {
    pickerColor(colorContrast, color);

    return (
      <IonContent>
        <IonHeader>
          <IonToolbar style={{'--background': color, '--color': colorContrast} as CSSProperties}>
            <IonTitle>
              {props.invoice !== undefined && props.invoice.client && props.invoice.client.name !== undefined ? props.invoice.client.name : ''}
            </IonTitle>
            <IonButtons slot="start">
              <IonButton onClick={() => props.closeAction()}>
                <IonIcon icon={close} slot="icon-only"></IonIcon>
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <main className="ion-padding">
          {renderInformation()}
          {renderFilter()}
        </main>

        <IonLoading isOpen={inProgress} message={t('common:actions.wait')} />
      </IonContent>
    );
  }

  function renderInformation() {
    let ratio: string | undefined = budgetRatio({
      budget: props.invoice?.project?.budget,
      extra: billable?.billable,
      period: {from, to},
    });

    if (ratio === undefined) {
      ratio = '0%';
    }

    const period: boolean = props.invoice?.project?.budget?.type === 'yearly' || props.invoice?.project?.budget?.type === 'monthly';

    return (
      <>
        {renderBillable({ratio, period})}
        {renderBudget({ratio, period})}
      </>
    );
  }

  function renderBillable({ratio, period}: {ratio: string | undefined; period: boolean}) {
    if (from === undefined || to === undefined) {
      return <p>{t('invoices:invoice.no_period')}</p>;
    }

    if (billable === undefined) {
      return <p>{t('invoices:invoice.empty')}</p>;
    }

    if (period) {
      return (
        <p
          dangerouslySetInnerHTML={{
            __html: t('invoices:invoice.billable_period', {
              amount: formatCurrency(billable.billable, settings.currency.currency),
              hours: formatTime(billable.hours * 3600 * 1000),
              ratio,
            }),
          }}></p>
      );
    }

    return (
      <p
        dangerouslySetInnerHTML={{
          __html: t('invoices:invoice.billable', {
            amount: formatCurrency(billable.billable, settings.currency.currency),
            hours: formatTime(billable.hours * 3600 * 1000),
          }),
        }}></p>
    );
  }

  function renderBudget({ratio, period}: {ratio: string | undefined; period: boolean}) {
    if (!props.invoice || !props.invoice.project || !props.invoice.project.budget || billable === undefined) {
      return undefined;
    }

    const billed: number = props.invoice.project.budget.billed !== undefined ? props.invoice.project.budget.billed : 0;
    const cumulated: string = formatCurrency(billed + billable.billable, settings.currency.currency);

    if (props.invoice.project.budget.budget === undefined || props.invoice.project.budget.budget <= 0 || period) {
      return <p dangerouslySetInnerHTML={{__html: t('invoices:invoice.billed', {amount: cumulated})}}></p>;
    }

    return <p dangerouslySetInnerHTML={{__html: t('invoices:invoice.budget', {amount: cumulated, ratio: ratio})}}></p>;
  }

  function renderFilter() {
    return (
      <>
        <IonList className="inputs-list">
          <IonItem className="item-title">
            <IonLabel>{t('invoices:invoice.from')}</IonLabel>
          </IonItem>

          <IonItem className="item-input">
            <DatePicker
              DialogProps={{disableEnforceFocus: true}}
              value={from}
              onChange={(date: MaterialUiPickersDate) => setFrom(date as Date)}
              format="yyyy/MM/dd"
            />
          </IonItem>

          <IonItem className="item-title">
            <IonLabel>{t('invoices:invoice.to')}</IonLabel>
          </IonItem>

          <IonItem className="item-input">
            <DatePicker
              DialogProps={{disableEnforceFocus: true}}
              value={to}
              onChange={(date: MaterialUiPickersDate) => setTo(date as Date)}
              format="yyyy/MM/dd"
            />
          </IonItem>

          <IonItem className="item-title">
            <IonLabel>{t('invoices:invoice.close')}</IonLabel>
          </IonItem>

          <IonItem className="item-checkbox">
            <IonLabel>{t('invoices:invoice.entries_billed')}</IonLabel>
            <IonCheckbox
              slot="end"
              style={{'--background-checked': color, '--border-color-checked': color} as CSSProperties}
              checked={bill}
              onIonChange={($event: CustomEvent) => setBill($event.detail.checked)}></IonCheckbox>
          </IonItem>
        </IonList>

        <div className="actions">
          {renderExportExcel()}

          {renderExportPdf()}

          <button type="button" onClick={() => props.closeAction()} disabled={inProgress}>
            {t('common:actions.cancel')}
          </button>
        </div>
      </>
    );
  }

  function renderExportExcel() {
    return (
      <IonButton
        type="button"
        onClick={() => exportInvoice('xlsx')}
        disabled={billable === undefined || inProgress}
        style={
          {
            '--background': color,
            '--color': colorContrast,
            '--background-hover': color,
            '--color-hover': colorContrast,
            '--background-activated': colorContrast,
            '--color-activated': color,
          } as CSSProperties
        }>
        <IonLabel>{t('export:excel')}</IonLabel>
      </IonButton>
    );
  }

  function renderExportPdf() {
    return (
      <IonButton
        type="button"
        onClick={() => exportInvoice('pdf')}
        fill="outline"
        disabled={billable === undefined || inProgress}
        style={
          {
            '--border-color': color,
            '--background': 'transparent',
            '--color': 'inherit',
            '--background-hover': color,
            '--color-hover': colorContrast,
            '--background-activated': colorContrast,
            '--color-activated': color,
          } as CSSProperties
        }>
        <IonLabel>{t('export:pdf')}</IonLabel>
      </IonButton>
    );
  }
};

export default rootConnector(InvoiceModal);
