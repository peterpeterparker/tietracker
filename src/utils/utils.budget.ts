import i18n from 'i18next';

export function budgetUsed(budget: number | undefined, billed: number | undefined): string | undefined {
  if (!budget || budget === undefined || budget <= 0) {
    return undefined;
  }

  if (!billed || billed === undefined || billed <= 0) {
    return new Intl.NumberFormat(i18n.language, {style: 'percent'}).format(0);
  }

  console.log(billed, budget, billed / budget);

  return new Intl.NumberFormat(i18n.language, {style: 'percent'}).format(billed / budget);
}
