import {TestIds} from './test-id';

export const testIds = {
  nav: {
    more: 'btn-nav-more',
    invoices: 'btn-nav-invoices',
  },
  invoices: {
    open: 'btn-open-export',
    export: 'btn-export-invoice',
  },
  more: {
    openBackup: 'btn-open-backup',
  },
  backup: {
    restore: 'input-restore',
    restoreConfirm: "btn-restore-confirm",
  },
} as const satisfies TestIds;
