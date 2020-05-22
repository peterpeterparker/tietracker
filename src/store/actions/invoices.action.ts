import {InvoicesActionTypes, LIST_PROJECTS_INVOICES} from '../types/invoices.types';

import {Invoice} from '../interfaces/invoice';

export function listProjectsInvoices(invoices: Invoice[]): InvoicesActionTypes {
  return {
    type: LIST_PROJECTS_INVOICES,
    payload: invoices,
  };
}
