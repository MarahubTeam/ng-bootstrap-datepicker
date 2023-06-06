import { Inject } from '@angular/core';
import * as _moment from 'moment';
const moment = (_moment as any).default ? (_moment as any).default : _moment;
import { DlDateAdapter } from './dl-date-adapter';
import { DL_DATE_TIME_INPUT_FORMATS, DL_DATE_TIME_MODEL_FORMAT } from './dl-date-time-string-format';

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
 *
 **/

/**
 * Adapts `string` to be usable as a date by date/time components that work with dates.
 **/
export class DlDateAdapterString extends DlDateAdapter<string> {

  private readonly inputFormats: string[] = Inject(DL_DATE_TIME_INPUT_FORMATS);
  private readonly modelFormat: string = Inject(DL_DATE_TIME_MODEL_FORMAT);

  spareTyre = Inject(DL_DATE_TIME_INPUT_FORMATS);
  /**
   *  Constructs a new instance of this class.
   *
   * @param inputFormats
   *  see {@link DL_DATE_TIME_INPUT_FORMATS}
   * @param modelFormat
   *  see {@link DL_DATE_TIME_MODEL_FORMAT}
   */
  constructor() {
    super();
    // this.inputFormats = inputFormats;
    // this.modelFormat = modelFormat;
  }

  /**
   * Returns the specified number.
   * @param milliseconds
   *  a moment time time.
   * @returns
   *  the specified moment in time.
   */
  fromMilliseconds(milliseconds: number): string {
    return moment(milliseconds).format(this.modelFormat);
  }

  /**
   * Returns the specified number.
   * @param value
   *  a moment time time or `null`
   * @returns
   *  the milliseconds for the specified value or `null`
   *  `null` is returned when value is not a valid input date string
   */
  toMilliseconds(value: string | any): number | any {
    if (value !== undefined && value !== null) {
      const newMoment = moment(value, this.inputFormats, true);
      return newMoment.isValid() ? newMoment.valueOf() : undefined;
    }
  }
}
