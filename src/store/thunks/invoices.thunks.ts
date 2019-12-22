import {RootThunkResult} from './types.thunks';

import {LIST_PROJECTS_INVOICES} from '../types/invoices.types';

import {InvoicesService} from '../../services/invoices/invoices.services';

import {Invoice} from '../../models/invoice';

export function listProjectsInvoices(): RootThunkResult<Promise<void>> {
    return async (dispatch, getState) => {
        await InvoicesService.getInstance().listProjectsInvoices((data: Invoice[]) => {
            dispatch({type: LIST_PROJECTS_INVOICES, payload: data});
        });
    };
}
