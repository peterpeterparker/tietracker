import i18n from 'i18next';

export function budgetRatio(budget: number | undefined, billed: number | undefined, extra?: number): string | undefined {
  if (!budget || budget === undefined || budget <= 0) {
    return undefined;
  }

  const cumulated: number | undefined = extra !== undefined && extra >= 0 && billed !== undefined && billed >= 0 ? extra + billed : billed;

  if (cumulated === undefined || cumulated <= 0) {
    return new Intl.NumberFormat(i18n.language, {style: 'percent'}).format(0);
  }

  return new Intl.NumberFormat(i18n.language, {style: 'percent'}).format(cumulated / budget);
}
