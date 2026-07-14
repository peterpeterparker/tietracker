import {TestIds} from './test-id';

export const testIds = {
  nav: {
    more: 'btn-nav-more',
    invoices: 'btn-nav-invoices',
  },
  invoices: {
    open: 'btn-open-export',
  },
} as const satisfies TestIds;
