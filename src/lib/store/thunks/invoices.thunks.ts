import {InvoicesService} from '../../services/invoices.service';
import {Invoice} from '../interfaces/invoice';
import {LIST_PROJECTS_INVOICES} from '../types/invoices.types';
import type {WithSettings} from '../types/store.types';
import {RootThunkResult} from './types.thunks';

export function listProjectsInvoices({settings}: WithSettings): RootThunkResult<Promise<void>> {
  return async (dispatch, _getState) => {
    await InvoicesService.create(settings).listProjectsInvoices((data: Invoice[]) => {
      dispatch({type: LIST_PROJECTS_INVOICES, payload: data});
    });
  };
}
