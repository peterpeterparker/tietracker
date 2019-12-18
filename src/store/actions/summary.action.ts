import { SummaryActionTypes, COMPUTE_SUMMARY } from '../types/summary.types';

import { Summary } from '../../services/summary/summary.service';

export function computeSummary(summary: Summary): SummaryActionTypes {
    return {
        type: COMPUTE_SUMMARY,
        payload: summary
    }
}
