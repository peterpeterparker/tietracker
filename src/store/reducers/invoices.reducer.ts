import {LIST_PROJECTS_INVOICES, InvoicesActionTypes} from '../types/invoices.types';

import {Invoice} from '../interfaces/invoice';

export interface InvoicesState {
  invoices: Invoice[];
}

const initialState: InvoicesState = {
  invoices: [],
};

export function invoicesReducer(state = initialState, action: InvoicesActionTypes): InvoicesState {
  switch (action.type) {
    case LIST_PROJECTS_INVOICES:
      return {
        invoices: [...action.payload],
      };
    default:
      return state;
  }
}
