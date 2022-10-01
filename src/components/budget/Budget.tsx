import {IonIcon, IonLabel} from '@ionic/react';
import React from 'react';

import {useTranslation} from 'react-i18next';

import {rootConnector, RootProps} from '../../store/thunks/index.thunks';

import {ProjectDataBudget} from '../../models/project';

import {pricetagOutline, trendingUpOutline} from 'ionicons/icons';

import {formatCurrency} from '../../utils/utils.currency';

interface BudgetProps extends RootProps {
  budget: ProjectDataBudget | undefined;
}

const Budget: React.FC<BudgetProps> = (props) => {
  const {t} = useTranslation('clients');

  return (
    <>
      {renderBudget()}
      {renderBilled()}
    </>
  );

  function renderBudget() {
    if (!props.budget) {
      return undefined;
    }

    return (
      <IonLabel>
        <IonIcon icon={pricetagOutline} aria-label={t('details.billed')} />{' '}
        {formatCurrency(props.budget.budget, props.settings.currency.currency)}
      </IonLabel>
    );
  }

  function renderBilled() {
    if (!props.budget) {
      return undefined;
    }

    const billed: number | undefined =
      props.budget.billed !== undefined && props.budget.billed >= 0 ? props.budget.billed : 0;

    return (
      <IonLabel>
        <IonIcon icon={trendingUpOutline} aria-label={t('details.billed')} />{' '}
        {formatCurrency(billed, props.settings.currency.currency)}
      </IonLabel>
    );
  }
};

export default rootConnector(Budget);
