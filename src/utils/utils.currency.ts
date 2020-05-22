import i18n from 'i18next';

export function formatCurrency(value: number | undefined, currency: string): string {
  if (!currency || currency === undefined) {
    return new Intl.NumberFormat(i18n.language).format(0);
  }

  if (!value || value === undefined) {
    return new Intl.NumberFormat(i18n.language, {style: 'currency', currency: currency}).format(0);
  }

  return new Intl.NumberFormat(i18n.language, {style: 'currency', currency: currency}).format(value);
}
