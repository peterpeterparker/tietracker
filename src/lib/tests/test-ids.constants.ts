import {TestIds} from './test-id';

export const testIds = {
  nav: {
    home: 'btn-nav-home',
    more: 'btn-nav-more',
    invoices: 'btn-nav-invoices',
  },
  header: {
    close: 'btn-header-close',
  },
  home: {
    summary: 'cards-home-summary',
    projects: 'cards-home-projects',
    tasks: 'cards-home-tasks',
  },
  invoices: {
    open: 'btn-open-export',
    exportInvoice: 'btn-export-invoice',
    backupInvoices: 'btn-backup-invoices',
    closeInvoice: 'checkbox-bill-invoice',
  },
  more: {
    openBackup: 'btn-open-backup',
  },
  backup: {
    restore: 'input-restore',
    restoreConfirm: 'btn-restore-confirm',
    backup: 'btn-backup',
  },
  tasks: {
    openAddEntry: 'btn-open-add-entry',
    openSelectProject: 'btn-open-select-project',
    openSelectDescription: 'btn-open-select-description',
    submit: 'btn-add-entry-submit',
  },
  clients: {
    openCreateClient: 'btn-open-create-client',
    clientName: 'input-client-name',
    projectName: 'input-project-name',
    rate: 'input-rate',
    color: 'input-color',
    submit: 'btn-create-client-submit',
  },
} as const satisfies TestIds;
