import i18n from 'i18next';

// TODO: Extract CHF as variable

export function formatCurrency(value: number | undefined): string {
    if (!value || value === undefined) {
        return new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'CHF' }).format(0);
    }

    return new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'CHF' }).format(value);
}
