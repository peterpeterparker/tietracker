import {InvoicesActionTypes, LIST_PROJECTS_INVOICES} from '../types/invoices.types';

import {Invoice} from '../../models/invoice';

export function listProjectsInvoices(invoices: Invoice[]): InvoicesActionTypes {
    return {
        type: LIST_PROJECTS_INVOICES,
        payload: invoices
    }
}
