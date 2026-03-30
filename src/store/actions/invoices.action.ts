import {Invoice} from '../interfaces/invoice';
import {InvoicesActionTypes, LIST_PROJECTS_INVOICES} from '../types/invoices.types';

export function listProjectsInvoices(invoices: Invoice[]): InvoicesActionTypes {
  return {
    type: LIST_PROJECTS_INVOICES,
    payload: invoices,
  };
}
