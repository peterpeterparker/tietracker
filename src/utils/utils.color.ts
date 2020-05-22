// Ionic Color Generator: https://github.com/ionic-team/ionic-docs/blob/master/src/components/color-gen/color.ts

interface RGB {
  b: number;
  g: number;
  r: number;
}

function rgbToYIQ({r, g, b}: RGB): number {
  return (r * 299 + g * 587 + b * 114) / 1000;
}

// https://stackoverflow.com/a/5624139/5404186
function hexToRgb(hex: string): RGB | undefined {
  if (!hex || hex === undefined || hex === '') {
    return undefined;
  }

  const result: RegExpExecArray | null = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : undefined;
}

export function contrast(colorHex: string | undefined, threshold: number = 128, invert: boolean = false): string {
  if (colorHex === undefined) {
    return invert ? '#fff' : '#000';
  }

  const rgb: RGB | undefined = hexToRgb(colorHex);

  if (rgb === undefined) {
    return invert ? '#fff' : '#000';
  }

  return rgbToYIQ(rgb) >= threshold ? (invert ? '#fff' : '#000') : invert ? '#000' : '#fff';
}
