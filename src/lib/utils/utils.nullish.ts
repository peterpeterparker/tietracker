/**
 * Checks if a given argument is null or undefined.
 *
 * @template T - The type of the argument.
 * @param {T | undefined | null} argument - The argument to check.
 * @returns {argument is undefined | null} `true` if the argument is null or undefined; otherwise, `false`.
 */
export const isNullish = <T>(argument: T | undefined | null): argument is undefined | null =>
  argument === null || argument === undefined;

/**
 * Checks if a given argument is neither null nor undefined.
 *
 * @template T - The type of the argument.
 * @param {T | undefined | null} argument - The argument to check.
 * @returns {argument is NonNullable<T>} `true` if the argument is not null or undefined; otherwise, `false`.
 */
export const nonNullish = <T>(argument: T | undefined | null): argument is NonNullable<T> =>
  !isNullish(argument);

/**
 * Checks if a given value is not null, not undefined, and not an empty string.
 *
 * @param {string | undefined | null} value - The value to check.
 * @returns {boolean} `true` if the value is not null, not undefined, and not an empty string; otherwise, `false`.
 */
export const notEmptyString = (value: string | undefined | null): value is string =>
  nonNullish(value) && value !== '';

/**
 * Checks if a given value is null, undefined, or an empty string.
 *
 * @param {string | undefined | null} value - The value to check.
 * @returns {value is undefined | null | ""} Type predicate indicating if the value is null, undefined, or an empty string.
 */
export const isEmptyString = (value: string | undefined | null): value is undefined | null | '' =>
  !notEmptyString(value);
