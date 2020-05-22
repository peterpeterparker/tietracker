import i18next from 'i18next';

export function xlsxLabels() {
  return {
    total: i18next.t('export:total'),
    billable_subtotal: i18next.t('export:billable_subtotal'),
    vat_rate: i18next.t('export:vat_rate'),
    vat: i18next.t('export:vat'),
    total_vat_excluded: i18next.t('export:total_vat_excluded'),
    total_billable_hours: i18next.t('export:total_billable_hours'),
    description: i18next.t('export:description'),
    start_date: i18next.t('export:start_date'),
    start_time: i18next.t('export:start_time'),
    end_date: i18next.t('export:end_date'),
    end_time: i18next.t('export:end_time'),
    duration: i18next.t('export:duration'),
    billable: i18next.t('export:billable'),
    client: i18next.t('export:client'),
    project: i18next.t('export:project'),
  };
}
