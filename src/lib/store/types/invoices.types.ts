import {Invoice} from '../interfaces/invoice';

export const LIST_PROJECTS_INVOICES = 'LIST_PROJECTS_INVOICES';

interface InvoicesAction {
  type: typeof LIST_PROJECTS_INVOICES;
  payload: Invoice[];
}

export type InvoicesActionTypes = InvoicesAction;
