import React from 'react';
import {IonIcon, IonLabel} from '@ionic/react';

import {useTranslation} from 'react-i18next';

import {rootConnector, RootProps} from '../../store/thunks/index.thunks';

import {ProjectDataBudget} from '../../models/project';

import {trendingUpOutline, pricetagOutline} from 'ionicons/icons';

import {formatCurrency} from '../../utils/utils.currency';
import {budgetRatio} from '../../utils/utils.budget';

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
        <IonIcon icon={pricetagOutline} aria-label={t('details.billed')} /> {formatCurrency(props.budget.budget, props.settings.currency.currency)}
      </IonLabel>
    );
  }

  function renderBilled() {
    if (!props.budget) {
      return undefined;
    }

    const billed: number | undefined = props.budget.billed !== undefined && props.budget.billed >= 0 ? props.budget.billed : 0;

    return (
      <IonLabel>
        <IonIcon icon={trendingUpOutline} aria-label={t('details.billed')} /> {formatCurrency(billed, props.settings.currency.currency)}
        &nbsp;
        {renderBudgetUsed(billed)}
      </IonLabel>
    );
  }

  function renderBudgetUsed(billed: number | undefined) {
    if (!props.budget) {
      return undefined;
    }

    const used: string | undefined = budgetRatio(props.budget.budget, billed);

    if (!used) {
      return undefined;
    }

    return <small>({used})</small>;
  }
};

export default rootConnector(Budget);
