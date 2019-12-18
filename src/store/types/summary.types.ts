import { Summary } from "../../services/summary/summary.service";

export const COMPUTE_SUMMARY = 'COMPUTE_SUMMARY';

interface SummaryAction {
    type: typeof COMPUTE_SUMMARY
    payload: Summary
}

export type SummaryActionTypes = SummaryAction
