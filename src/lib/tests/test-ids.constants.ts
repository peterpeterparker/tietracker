import {TestIds} from './test-id';

export const testIds = {
  nav: {
    more: 'btn-nav-more',
    invoices: 'btn-nav-invoices',
  },
  header: {
    close: 'btn-header-close',
  },
  invoices: {
    open: 'btn-open-export',
    exportInvoice: 'btn-export-invoice',
    backupInvoices: 'btn-backup-invoices',
  },
  more: {
    openBackup: 'btn-open-backup',
  },
  backup: {
    restore: 'input-restore',
    restoreConfirm: 'btn-restore-confirm',
  },
} as const satisfies TestIds;
