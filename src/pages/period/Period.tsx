import React, {useEffect, useState} from 'react';

import {useTranslation} from 'react-i18next';

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

import DateFnsUtils from '@date-io/date-fns';
import {MaterialUiPickersDate} from '@material-ui/pickers/typings/date';
import {DatePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';

import styles from './Period.module.scss';

import Loading from '../../components/loading/Loading';

import {format} from '../../utils/utils.date';

import {InvoicesPeriod, InvoicesService} from '../../services/invoices/invoices.service';
import {isBefore} from 'date-fns';
import {RestoreService} from '../../services/restore/restore.service';

const Period: React.FC = () => {
  const {t} = useTranslation(['period', 'common', 'invoices']);

  const [period, setPeriod] = useState<InvoicesPeriod | undefined>(undefined);

  const [from, setFrom] = useState<Date | undefined>(undefined);
  const [to, setTo] = useState<Date | undefined>(undefined);

  const [processing, setProcessing] = useState<boolean>(false);

  const [valid, setValid] = useState<boolean>(true);

  const [present] = useIonAlert();

  useIonViewWillEnter(async () => {
    const period: InvoicesPeriod | undefined = await InvoicesService.getInstance().period();
    setPeriod(period);

    setFrom(period?.from);
    setTo(period?.to);
  });

  useEffect(() => {
    setValid(from !== undefined && to !== undefined && isBefore(from, to));
  }, [from, to]);

  const doDeleteInvoices = () => {
    present({
      header: t('period:alert.warning'),
      message: t('period:alert.sure'),
      buttons: [
        t('common:actions.cancel'),
        {
          text: t('common:actions.ok'),
          handler: async () => {
            setProcessing(true);
          },
        },
      ],
    });
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

          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <p
              className={`${styles.text} ion-padding-top`}
              dangerouslySetInnerHTML={{__html: t('period:invoices', {from: format(period?.from), to: format(period?.to)})}}></p>

            <p>{t('period:text')}</p>

            {renderFilter()}

            <div className={`actions ${styles.actions} ion-padding-top`}>{renderActions()}</div>
          </MuiPickersUtilsProvider>
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
        <IonButton type="button" color="danger" onClick={doDeleteInvoices} style={{marginTop: '8px'}} disabled={!valid}>
          <IonLabel>{t('period:close')}</IonLabel>
        </IonButton>
      </>
    );
  }
};

export default Period;
