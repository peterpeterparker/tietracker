// TODO: Export definitions in next version of the component

interface DeckdeckgoBarChartDataValue {
  key: number | string;
  label: string;
  value: number;
}
interface DeckdeckgoBarChartData {
  label: string | Date | number;
  values: DeckdeckgoBarChartDataValue[];
}
