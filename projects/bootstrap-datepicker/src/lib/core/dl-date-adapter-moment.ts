import * as _moment from 'moment';
const moment = (_moment as any).default ? (_moment as any).default : _moment;
import { Moment } from 'moment';
import { DlDateAdapter } from './dl-date-adapter';
import { RangeDate } from '../dl-date-time-picker/dl-date-time-picker-model';

/**
 * Work around for moment namespace conflict when used with webpack and rollup.
 * See https://github.com/dherges/ng-packagr/issues/163
 *
 * Depending on whether rollup is used, moment needs to be imported differently.
 * Since Moment.js doesn't have a default export, we normally need to import using
 * the `* as`syntax.
 *
 * rollup creates a synthetic default module and we thus need to import it using
 * the `default as` syntax.
 *
 * @internal
 **/
/**
 * Adapts `moment` to be usable as a date by date/time components that work with dates.
 **/
export class DlDateAdapterMoment extends DlDateAdapter<Moment> {

  /**
   * Create a new instance of a `moment` type from milliseconds.
   * @param milliseconds
   *  a time value as milliseconds (local time zone)
   * @returns
   *  an instance of `moment` for the specified moment in time.
   */
  fromMilliseconds(milliseconds: number): Moment {
    return moment(milliseconds);
  }

  /**
   * Returns a moment in time value as milliseconds (local time zone).
   * @param value
   *  a moment or `null`.
   * @returns
   *  a `moment.valueOf()` result for the specified `moment` or `null` or `undefined`
   */
  toMilliseconds(value: Moment | any): number | null {
    return (value) ? value.valueOf() : undefined;
  }

  /**
   * Returns a moment in range time value as milliseconds (local time zone).
   * @param value
   *  a moment or `null`.
   * @returns
   *  a `moment.valueOf()` result for the specified `moment` or `null`
   */
  toRangeMilliseconds(value: Moment | any | RangeDate): number | null | RangeDate {
    return {
      startDate: (value?.startDate) ? value?.startDate?.valueOf() : undefined,
      endDate: (value?.endDate) ? value?.endDate?.valueOf() : undefined,
    }
  }
}
