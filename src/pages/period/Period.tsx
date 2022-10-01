import React, {useEffect, useState} from 'react';

import {useTranslation} from 'react-i18next';

import {isBefore} from 'date-fns';

import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonToolbar,
  useIonAlert,
  useIonViewWillEnter,
} from '@ionic/react';

import styles from './Period.module.scss';

import Loading from '../../components/loading/Loading';

import {format} from '../../utils/utils.date';

import {InputAdornment, TextField} from '@mui/material';
import {DatePicker, LocalizationProvider, MobileDatePicker} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {Calendar} from '@mui/x-date-pickers/internals/components/icons';
import {InvoicesPeriod, InvoicesService} from '../../services/invoices/invoices.service';

const Period: React.FC = () => {
  const {t} = useTranslation(['period', 'common', 'invoices']);

  const [period, setPeriod] = useState<InvoicesPeriod | undefined>(undefined);

  const [from, setFrom] = useState<Date | undefined>(undefined);
  const [to, setTo] = useState<Date | undefined>(undefined);

  const [processing, setProcessing] = useState<boolean>(false);

  const [valid, setValid] = useState<boolean>(true);

  const [present] = useIonAlert();

  useIonViewWillEnter(async () => await initPeriod());

  useEffect(() => {
    setFrom(period?.from);
    setTo(period?.to);
  }, [period]);

  useEffect(() => {
    setValid(from !== undefined && to !== undefined && isBefore(from, to));
  }, [from, to]);

  const initPeriod = async () => {
    const period: InvoicesPeriod | undefined = await InvoicesService.getInstance().period();
    setPeriod(period);
  };

  const doDeleteInvoices = async () => {
    if (!from || !to || !valid) {
      return;
    }

    await present({
      header: t('period:alert.warning'),
      message: t('period:alert.sure'),
      buttons: [
        t('common:actions.cancel'),
        {
          text: t('common:actions.ok'),
          handler: async () => {
            setProcessing(true);

            await InvoicesService.getInstance().closeInvoices({from, to, done});
          },
        },
      ],
    });
  };

  const done = async (success: boolean) => {
    setProcessing(false);

    if (!success) {
      return;
    }

    await initPeriod();
  };

  return (
    <IonPage>
      <IonContent>
        <main className="ion-padding">
          <IonHeader>
            <IonToolbar className="title">
              <IonButtons slot="start">
                <IonBackButton defaultHref="/more" />
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <p
              className={`${styles.text} ion-padding-top`}
              dangerouslySetInnerHTML={{
                __html: t('period:invoices', {
                  from: format(period?.from) ?? t('period:unknown'),
                  to: format(period?.to) ?? t('period:unknown'),
                }),
              }}></p>

            <p>{t('period:text')}</p>

            <p>{t('period:text-more')}</p>

            {renderFilter()}

            <div className={`actions ${styles.actions} ion-padding-top`}>{renderActions()}</div>
          </LocalizationProvider>
        </main>
      </IonContent>
    </IonPage>
  );

  function renderFilter() {
    return (
      <>
        <IonList className="inputs-list">
          <IonItem className="item-title">
            <IonLabel>{t('invoices:invoice.from')}</IonLabel>
          </IonItem>

          <IonItem className="item-input">
            <MobileDatePicker
              DialogProps={{disableEnforceFocus: true}}
              value={from}
              onChange={(date: Date | null) => setFrom(date as Date)}
              inputFormat="yyyy/MM/dd"
              renderInput={(params) => <TextField {...params} />}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Calendar />
                  </InputAdornment>
                ),
              }}
            />
          </IonItem>

          <IonItem className="item-title">
            <IonLabel>{t('invoices:invoice.to')}</IonLabel>
          </IonItem>

          <IonItem className="item-input">
            <DatePicker
              DialogProps={{disableEnforceFocus: true}}
              value={to}
              onChange={(date: Date | null) => setTo(date as Date)}
              inputFormat="yyyy/MM/dd"
              renderInput={(params) => <TextField {...params} />}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Calendar />
                  </InputAdornment>
                ),
              }}
            />
          </IonItem>
        </IonList>
      </>
    );
  }

  function renderActions() {
    if (processing) {
      return <Loading></Loading>;
    }

    return (
      <>
        <IonButton
          type="button"
          color="danger"
          onClick={doDeleteInvoices}
          style={{marginTop: '8px'}}
          disabled={!valid}>
          <IonLabel>{t('period:close')}</IonLabel>
        </IonButton>
      </>
    );
  }
};

export default Period;
