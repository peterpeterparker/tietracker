import {isTest} from '../env';
import {nonNullish} from '../utils/utils.nullish';
import {TestId} from './test-id';

export const testId = (testId: Option<TestId>): {['data-tid']?: string} => ({
  ...(isTest() && nonNullish(testId) && {'data-tid': testId}),
});
