/**
 * @license
 * Copyright 2013-present Dale Lotts All Rights Reserved.
 * http://www.dalelotts.com
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/dalelotts/angular-bootstrap-datetimepicker/blob/master/LICENSE
 */

import { RangeDate } from "./dl-date-time-picker-model";

/**
 * Emitted when the value of a date/time picker changes.
 */
export class DlDateTimePickerChange<D> {

  /**
   * The new value of the picker.
   */
  private readonly _value: D | RangeDate;
  private readonly _viewName?: string;

  /**
   * Constructs a new instance.
   * @param newValue
   *  the new value of the date/time picker.
   */
  constructor(newValue: D, viewName?: string) {
    this._value = newValue;
    this._viewName = viewName;
  }

  /**
   * Get the new value of the date/time picker.
   * @returns the new value or null.
   */
  get value(): D | RangeDate {
    return this._value;
  }

  get viewName(): string {
    return this._viewName || '';
  }
}
