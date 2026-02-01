import i18n from 'i18next';

import {
  differenceInMonths,
  differenceInWeeks,
  differenceInYears,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';

import {ProjectDataBudget} from '../models/project';

export function budgetRatio({
  budget,
  extra = undefined,
  period,
}: {
  budget: ProjectDataBudget | undefined;
  extra?: number;
  period: {from: Date | undefined; to: Date | undefined};
}): string | undefined {
  if (!budget || budget === undefined || budget.budget <= 0) {
    return undefined;
  }

  const {budget: limit, type, billed} = budget;

  if (!period.to || !period.from || type === 'project' || !type) {
    const cumulated: number | undefined =
      extra !== undefined && extra >= 0 && billed !== undefined && billed >= 0
        ? extra + billed
        : billed;

    if (cumulated === undefined || cumulated <= 0) {
      return new Intl.NumberFormat(i18n.language, {style: 'percent'}).format(0);
    }

    return new Intl.NumberFormat(i18n.language, {style: 'percent'}).format(cumulated / limit);
  }

  if (!extra) {
    return undefined;
  }

  const multiplyBudget =
    type === 'weekly'
      ? differenceInWeeks(startOfWeek(period.to), startOfWeek(period.from))
      : type === 'monthly'
        ? differenceInMonths(startOfMonth(period.to), startOfMonth(period.from))
        : differenceInYears(startOfYear(period.to), startOfYear(period.from));

  return new Intl.NumberFormat(i18n.language, {style: 'percent'}).format(
    extra / (limit * (multiplyBudget + 1)),
  );
}
