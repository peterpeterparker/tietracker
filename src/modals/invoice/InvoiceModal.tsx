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
import {CalendarMonth} from '@mui/icons-material';
import {LocalizationProvider, MobileDatePicker} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {close} from 'ionicons/icons';
import React, {CSSProperties, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {ExportService} from '../../lib/services/export.service';
import {InvoicesPeriod, InvoicesService} from '../../lib/services/invoices.service';
import {Invoice} from '../../lib/store/interfaces/invoice';
import {RootState} from '../../lib/store/reducers';
import {rootConnector, RootProps} from '../../lib/store/thunks/index.thunks';
import {Settings} from '../../lib/types/settings';
import {budgetRatio} from '../../lib/utils/utils.budget';
import {contrast} from '../../lib/utils/utils.color';
import {formatCurrency} from '../../lib/utils/utils.currency';
import {emitError} from '../../lib/utils/utils.events';
import {pickerColor} from '../../lib/utils/utils.picker';
import {formatTime} from '../../lib/utils/utils.time';
import {testId} from '../../lib/tests/test.utils';
import {testIds} from '../../lib/tests/test-ids.constants';
import {isTest} from '../../lib/env';
import {isNullish} from '../../lib/utils/utils.nullish';

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

  const color =
    props.invoice !== undefined && props.invoice.client ? props.invoice.client.color : undefined;
  const colorContrast = contrast(color);

  const [billable, setBillable] = useState<Billable | undefined>(undefined);

  const [inProgress, setInProgress] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      document.addEventListener('ionBackButton', onBackButton);

      await init();
    })();

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
          : undefined,
      );
    } else {
      setFrom(undefined);
      setTo(undefined);
      setBillable(undefined);
    }
  }

  async function exportInvoice() {
    if (isNullish(props.invoice)) {
      return;
    }

    setInProgress(true);

    const download = async () => {
      await ExportService.getInstance().exportDownload(
        props.invoice as Invoice,
        from,
        to,
        settings.currency,
        settings.vat,
        bill,
        settings.signature,
      );
    }
    ;
    try {
      if (isTest()) {
        // Playwright does not support File System API?
        await download();
      } else if (isPlatform('hybrid')) {
        await ExportService.getInstance().exportMobileFileSystem(
          props.invoice,
          from,
          to,
          settings.currency,
          settings.vat,
          bill,
          settings.signature,
        );
      } else if ('showSaveFilePicker' in window) {
        await ExportService.getInstance().exportNativeFileSystem(
          props.invoice,
          from,
          to,
          settings.currency,
          settings.vat,
          bill,
          settings.signature,
        );
      } else {
        await download();
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
      emitError(err);
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
            : undefined,
        );
      },
      props.invoice.project_id,
      from,
      to,
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>{renderContent()}</LocalizationProvider>
  );

  function renderContent() {
    pickerColor(colorContrast, color);

    return (
      <IonContent>
        <IonHeader>
          <IonToolbar
            style={
              {
                '--background': color,
                '--color': colorContrast,
                '--ion-toolbar-color': colorContrast,
              } as CSSProperties
            }>
            <IonTitle>
              {props.invoice !== undefined &&
              props.invoice.client &&
              props.invoice.client.name !== undefined
                ? props.invoice.client.name
                : ''}
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

    const period =
      props.invoice?.project?.budget?.type === 'yearly' ||
      props.invoice?.project?.budget?.type === 'monthly' ||
      props.invoice?.project?.budget?.type === 'weekly';

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
    if (
      !props.invoice ||
      !props.invoice.project ||
      !props.invoice.project.budget ||
      billable === undefined
    ) {
      return undefined;
    }

    const billed: number =
      props.invoice.project.budget.billed !== undefined ? props.invoice.project.budget.billed : 0;
    const cumulated: string = formatCurrency(
      billed + billable.billable,
      settings.currency.currency,
    );

    if (
      props.invoice.project.budget.budget === undefined ||
      props.invoice.project.budget.budget <= 0 ||
      period
    ) {
      return (
        <p
          dangerouslySetInnerHTML={{__html: t('invoices:invoice.billed', {amount: cumulated})}}></p>
      );
    }

    return (
      <p
        dangerouslySetInnerHTML={{
          __html: t('invoices:invoice.budget', {amount: cumulated, ratio: ratio}),
        }}></p>
    );
  }

  function renderFilter() {
    return (
      <>
        <IonList className="inputs-list">
          <IonItem className="item-title">
            <IonLabel>{t('invoices:invoice.from')}</IonLabel>
          </IonItem>

          <IonItem className="item-input">
            <MobileDatePicker
              value={from}
              onChange={(date: Date | null) => setFrom(date as Date)}
              format="yyyy/MM/dd"
              slotProps={{
                inputAdornment: {
                  position: 'end',
                },
                openPickerIcon: () => <CalendarMonth />,
                dialog: {
                  disableEnforceFocus: true,
                },
              }}
            />
          </IonItem>

          <IonItem className="item-title">
            <IonLabel>{t('invoices:invoice.to')}</IonLabel>
          </IonItem>

          <IonItem className="item-input">
            <MobileDatePicker
              value={to}
              onChange={(date: Date | null) => setTo(date as Date)}
              format="yyyy/MM/dd"
              slotProps={{
                inputAdornment: {
                  position: 'end',
                },
                openPickerIcon: () => <CalendarMonth />,
                dialog: {
                  disableEnforceFocus: true,
                },
              }}
            />
          </IonItem>

          <IonItem className="item-title">
            <IonLabel>{t('invoices:invoice.close')}</IonLabel>
          </IonItem>

          <IonItem className="item-checkbox">
            <IonLabel>{t('invoices:invoice.entries_billed')}</IonLabel>
            <IonCheckbox
              slot="end"
              style={
                {'--background-checked': color, '--border-color-checked': color} as CSSProperties
              }
              checked={bill}
              onIonChange={($event: CustomEvent) => setBill($event.detail.checked)}></IonCheckbox>
          </IonItem>
        </IonList>

        <div className="actions">
          {renderExportExcel()}

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
        onClick={() => exportInvoice()}
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
        }
        {...testId(testIds.invoices.export)}>
        <IonLabel>{t('export:excel')}</IonLabel>
      </IonButton>
    );
  }
};

export default rootConnector(InvoiceModal);
