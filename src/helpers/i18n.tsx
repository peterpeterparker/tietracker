import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {initReactI18next} from 'react-i18next';

import enBackup from '../../public/assets/i18n/en/backup.json';
import enClients from '../../public/assets/i18n/en/clients.json';
import enCommon from '../../public/assets/i18n/en/common.json';
import enExport from '../../public/assets/i18n/en/export.json';
import enHeader from '../../public/assets/i18n/en/header.json';
import enHome from '../../public/assets/i18n/en/home.json';
import enInvoices from '../../public/assets/i18n/en/invoices.json';
import enMore from '../../public/assets/i18n/en/more.json';
import enNotifications from '../../public/assets/i18n/en/notifications.json';
import enPeriod from '../../public/assets/i18n/en/period.json';
import enProjects from '../../public/assets/i18n/en/projects.json';
import enSettings from '../../public/assets/i18n/en/settings.json';
import enSummary from '../../public/assets/i18n/en/summary.json';
import enTasks from '../../public/assets/i18n/en/tasks.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources: {
      en: {
        backup: enBackup,
        clients: enClients,
        common: enCommon,
        export: enExport,
        header: enHeader,
        home: enHome,
        invoices: enInvoices,
        more: enMore,
        notifications: enNotifications,
        period: enPeriod,
        projects: enProjects,
        settings: enSettings,
        summary: enSummary,
        tasks: enTasks,
      },
    },
  });

export default i18n;
