import { RangeDate } from '../dl-date-time-picker/dl-date-time-picker-model';
import { DlDateAdapter } from './dl-date-adapter';

/**
 * Adapts `number` to be usable as a date by date/time components that work with dates.
 * No op adapter.
 **/
export class DlDateAdapterNumber extends DlDateAdapter<number> {
  /**
   * Returns the specified number.
   * @param milliseconds
   *  a moment time time.
   * @returns
   *  the specified moment in time.
   */
  fromMilliseconds(milliseconds: number): number {
    return milliseconds;
  }

  /**
   * Returns the specified number.
   * @param value
   *  a moment time time or `null`
   * @returns
   *  the specified moment in time or `null`
   */
  toMilliseconds(value: number | null): number | null {
    return value;
  }


  /**
   * Returns a moment in range time value as milliseconds (local time zone).
   * @param value
   *  a moment or `null`.
   * @returns
   *  a `moment.valueOf()` result for the specified `moment` or `null`
   */
  toRangeMilliseconds(value: Date | any | RangeDate): number | null | RangeDate {
    return value;
  }
}
