type TestCTAType = 'btn' | 'link' | 'input';
type TestDisplayType = 'cards';

type TestAction = string;

export type TestId = `${TestCTAType | TestDisplayType}-${TestAction}`;

type TestSuite = string;

export type TestIds = Record<TestSuite, Record<string, TestId>>;
