export interface CurrencyFormat {
  name: string;
  fractionSize: number;
  symbol: {
    grapheme: string;
    template: string;
    rtl: boolean;
  } | null;
  uniqSymbol: boolean | null;
}

export interface Currency {
  currency: string;
  format: CurrencyFormat;
}
