import {InvoicesService} from '../../services/invoices.service';
import {Invoice} from '../interfaces/invoice';
import {LIST_PROJECTS_INVOICES} from '../types/invoices.types';
import {RootThunkResult} from './types.thunks';

export function listProjectsInvoices(): RootThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    await InvoicesService.getInstance().listProjectsInvoices((data: Invoice[]) => {
      dispatch({type: LIST_PROJECTS_INVOICES, payload: data});
    });
  };
}
