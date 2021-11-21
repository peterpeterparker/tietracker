import i18n from 'i18next';

import {differenceInMonths, differenceInYears, startOfMonth, startOfYear} from 'date-fns';

import {ProjectDataBudget} from '../models/project';

export function budgetRatio({
  budget,
  billed,
  extra = undefined,
  period,
}: {
  budget: ProjectDataBudget | undefined;
  billed: number | undefined;
  extra?: number;
  period: {from: Date | undefined; to: Date | undefined};
}): string | undefined {
  if (!budget || budget === undefined || budget.budget <= 0) {
    return undefined;
  }

  const cumulated: number | undefined = extra !== undefined && extra >= 0 && billed !== undefined && billed >= 0 ? extra + billed : billed;

  if (cumulated === undefined || cumulated <= 0) {
    return new Intl.NumberFormat(i18n.language, {style: 'percent'}).format(0);
  }

  const {budget: limit, type} = budget;

  if (!period.to || !period.from || type === 'project') {
    return new Intl.NumberFormat(i18n.language, {style: 'percent'}).format(cumulated / limit);
  }

  const multiplyBudget: number =
    type === 'monthly'
      ? differenceInMonths(startOfMonth(period.to), startOfMonth(period.from))
      : differenceInYears(startOfYear(period.to), startOfYear(period.from));

  return new Intl.NumberFormat(i18n.language, {style: 'percent'}).format(cumulated / (limit * (multiplyBudget + 1)));
}
