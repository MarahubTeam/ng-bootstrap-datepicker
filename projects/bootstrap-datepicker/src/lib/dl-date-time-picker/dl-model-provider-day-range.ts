/**
 * @license
 * Copyright 2013-present Dale Lotts All Rights Reserved.
 * http://www.dalelotts.com
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/dalelotts/angular-bootstrap-datetimepicker/blob/master/LICENSE
 */

import { SimpleChanges } from '@angular/core';
import * as _moment from 'moment';
const moment = (_moment as any).default ? (_moment as any).default : _moment;
import { DlDateTimeRangePickerModel } from './dl-date-time-picker-model';
import { DlModelProvider } from './dl-model-provider';

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
 * Default implementation for the `day` view.
 */
export class DlDayRangeModelProvider implements DlModelProvider {

  /**
   * Receives input changes detected by Angular.
   *
   * @param changes
   *  the input changes detected by Angular.
   */
  onChanges(
    // @ts-ignore
    changes: SimpleChanges
  ): void { }

  /**
   * Returns the `day` model for the specified moment in `local` time with the
   * `active` day set to the first day of the month.
   *
   * The `day` model represents a month (42 days) as six rows with seven columns
   * and each cell representing one-day increments.
   *
   * The `day` always starts at midnight.
   *
   * Each cell represents a one-day increment at midnight.
   *
   * @param milliseconds
   *  the moment in time from which the minute model will be created.
   * @param selectedMilliseconds
   *  the current value of the date/time picker.
   * @returns
   *  the model representing the specified moment in time.
   */
  getModel(milliseconds: number, selectedMilliseconds: number | any): DlDateTimeRangePickerModel {
    const startOfMonth = moment(milliseconds).startOf('month');
    const endOfMonth = moment(milliseconds).endOf('month');
    const startOfView = moment(startOfMonth).subtract(Math.abs(startOfMonth.weekday()), 'days');

    const startOfNextMonth = moment(startOfMonth).add(1, 'month').startOf('month');
    const endOfNextMonth = moment(startOfMonth).add(1, 'month').endOf('month');
    const startOfNextView = moment(startOfNextMonth).subtract(Math.abs(startOfNextMonth.weekday()), 'days');

    const rowNumbers = [0, 1, 2, 3, 4, 5];
    const columnNumbers = [0, 1, 2, 3, 4, 5, 6];

    const previousMonth = moment(startOfMonth).subtract(1, 'month');
    const nextMonth = moment(startOfMonth).add(1, 'month');
    const activeValue = moment(milliseconds).startOf('day').valueOf();
    const selectedStartValue = selectedMilliseconds.startDate === null || selectedMilliseconds.startDate === undefined
      ? selectedMilliseconds.startDate
      : moment(selectedMilliseconds.startDate).startOf('day').valueOf();
    const selectedEndValue = selectedMilliseconds.endDate === null || selectedMilliseconds.endDate === undefined
      ? selectedMilliseconds.endDate
      : moment(selectedMilliseconds.endDate).startOf('day').valueOf();
    return {
      viewName: 'day',
      viewStartLabel: startOfMonth.format('MMM YYYY'),
      viewEndLabel: endOfNextMonth.format('MMM YYYY'),
      activeDate: activeValue,
      leftButton: {
        value: previousMonth.valueOf(),
        ariaLabel: `Go to ${previousMonth.format('MMM YYYY')}`,
        classes: {},
      },
      upButton: {
        value: startOfMonth.valueOf(),
        ariaLabel: `Go to month view`,
        classes: {},
      },
      rightButton: {
        value: nextMonth.valueOf(),
        ariaLabel: `Go to ${nextMonth.format('MMM YYYY')}`,
        classes: {},
      },
      rowStartLabels: columnNumbers.map((column) => moment().weekday(column).format('dd')),
      rowsStart: rowNumbers.map(rowOfDays(startOfView, startOfMonth, endOfMonth, activeValue, selectedStartValue, selectedEndValue)),
      rowEndLabels: columnNumbers.map((column) => moment().weekday(column).format('dd')),
      rowsEnd: rowNumbers.map(rowOfDays(startOfNextView, startOfNextMonth, endOfNextMonth, activeValue, selectedStartValue, selectedEndValue)),
    };

    function rowOfDays(startOfView: moment.Moment, startOfMonth: moment.Moment, endOfMonth: moment.Moment, activeValue: number, selectedStartValue: number, selectedEndValue: number) {
      return (rowNumber: number) => {
        const currentMoment = moment();
        const cells = columnNumbers.map((columnNumber) => {
          const dayMoment = moment(startOfView).add((rowNumber * columnNumbers.length) + columnNumber, 'days');
          const isInRange = selectedStartValue && selectedEndValue && dayMoment.valueOf() > selectedStartValue && dayMoment.valueOf() < selectedEndValue;
          return {
            display: dayMoment.format('D'),
            ariaLabel: dayMoment.format('ll'),
            value: dayMoment.valueOf(),
            classes: {
              'dl-abdtp-active': activeValue === dayMoment.valueOf(),
              'dl-abdtp-hidden-range': dayMoment.isAfter(endOfMonth) || dayMoment.isBefore(startOfMonth),
              'dl-abdtp-selected': selectedStartValue === dayMoment.valueOf() || selectedEndValue === dayMoment.valueOf(),
              'dl-abdtp-now': dayMoment.isSame(currentMoment, 'day'),
              'dl-abdtp-in-range': isInRange,
            }
          };
        });
        return { cells };
      };
    }
  }

  /**
   * Move the active `day` one row `down` from the specified moment in time.
   *
   * Moving `down` can result in the `active` day being part of a different month than
   * the specified `fromMilliseconds`, in this case the month represented by the model
   * will change to show the correct hour.
   *
   * @param fromMilliseconds
   *  the moment in time from which the next `day` model `down` will be constructed.
   * @param selectedMilliseconds
   *  the current value of the date/time picker.
   * @returns
   *  model containing an `active` `day` one row `down` from the specified moment in time.
   */
  goDown(fromMilliseconds: number, selectedMilliseconds: number | any): DlDateTimeRangePickerModel {
    return this.getModel(moment(fromMilliseconds).add(7, 'days').valueOf(), selectedMilliseconds);
  }

  /**
   * Move the active `day` one row `up` from the specified moment in time.
   *
   * Moving `up` can result in the `active` day being part of a different month than
   * the specified `fromMilliseconds`, in this case the month represented by the model
   * will change to show the correct hour.
   *
   * @param fromMilliseconds
   *  the moment in time from which the next `day` model `up` will be constructed.
   * @param selectedMilliseconds
   *  the current value of the date/time picker.
   * @returns
   *  model containing an `active` `day` one row `up` from the specified moment in time.
   */
  goUp(fromMilliseconds: number, selectedMilliseconds: number | any): DlDateTimeRangePickerModel {
    return this.getModel(moment(fromMilliseconds).subtract(7, 'days').valueOf(), selectedMilliseconds);
  }

  /**
   * Move the `active` day one cell `left` in the current `day` view.
   *
   * Moving `left` can result in the `active` day being part of a different month than
   * the specified `fromMilliseconds`, in this case the month represented by the model
   * will change to show the correct year.
   *
   * @param fromMilliseconds
   *  the moment in time from which the `day` model to the `left` will be constructed.
   * @param selectedMilliseconds
   *  the current value of the date/time picker.
   * @returns
   *  model containing an `active` `day` one cell to the `left` of the specified moment in time.
   */
  goLeft(fromMilliseconds: number, selectedMilliseconds: number | any): DlDateTimeRangePickerModel {
    return this.getModel(moment(fromMilliseconds).subtract(1, 'day').valueOf(), selectedMilliseconds);
  }

  /**
   * Move the `active` day one cell `right` in the current `day` view.
   *
   * Moving `right` can result in the `active` day being part of a different month than
   * the specified `fromMilliseconds`, in this case the month represented by the model
   * will change to show the correct year.
   *
   * @param fromMilliseconds
   *  the moment in time from which the `day` model to the `right` will be constructed.
   * @param selectedMilliseconds
   *  the current value of the date/time picker.
   * @returns
   *  model containing an `active` `day` one cell to the `right` of the specified moment in time.
   */
  goRight(fromMilliseconds: number, selectedMilliseconds: number | any): DlDateTimeRangePickerModel {
    return this.getModel(moment(fromMilliseconds).add(1, 'day').valueOf(), selectedMilliseconds);
  }

  /**
   * Move the active `day` one month `down` from the specified moment in time.
   *
   * Paging `down` will result in the `active` day being part of a different month than
   * the specified `fromMilliseconds`. As a result, the month represented by the model
   * will change to show the correct year.
   *
   * @param fromMilliseconds
   *  the moment in time from which the next `day` model page `down` will be constructed.
   * @param selectedMilliseconds
   *  the current value of the date/time picker.
   * @returns
   *  model containing an `active` `day` one month `down` from the specified moment in time.
   */
  pageDown(fromMilliseconds: number, selectedMilliseconds: number | any): DlDateTimeRangePickerModel {
    return this.getModel(moment(fromMilliseconds).add(1, 'month').valueOf(), selectedMilliseconds);
  }

  /**
   * Move the active `day` one month `up` from the specified moment in time.
   *
   * Paging `up` will result in the `active` day being part of a different month than
   * the specified `fromMilliseconds`. As a result, the month represented by the model
   * will change to show the correct year.
   *
   * @param fromMilliseconds
   *  the moment in time from which the next `day` model page `up` will be constructed.
   * @param selectedMilliseconds
   *  the current value of the date/time picker.
   * @returns
   *  model containing an `active` `day` one month `up` from the specified moment in time.
   */
  pageUp(fromMilliseconds: number, selectedMilliseconds: number | any): DlDateTimeRangePickerModel {
    return this.getModel(moment(fromMilliseconds).subtract(1, 'month').valueOf(), selectedMilliseconds);
  }


  /**
   * Move the `active` `day` to the last day of the month.
   *
   * The view or time range will not change unless the `fromMilliseconds` value
   * is in a different day than the displayed decade.
   *
   * @param fromMilliseconds
   *  the moment in time from which the last day of the month will be calculated.
   * @param selectedMilliseconds
   *  the current value of the date/time picker.
   * @returns
   *  a model with the last cell in the view as the active `day`.
   */
  goEnd(fromMilliseconds: number, selectedMilliseconds: number | any): DlDateTimeRangePickerModel {
    return this.getModel(moment(fromMilliseconds)
      .endOf('month').startOf('day').valueOf(), selectedMilliseconds);
  }

  /**
   * Move the `active` `day` to the first day of the month.
   *
   * The view or time range will not change unless the `fromMilliseconds` value
   * is in a different day than the displayed decade.
   *
   * @param fromMilliseconds
   *  the moment in time from which the first day of the month will be calculated.
   * @param selectedMilliseconds
   *  the current value of the date/time picker.
   * @returns
   *  a model with the first cell in the view as the active `day`.
   */
  goHome(fromMilliseconds: number, selectedMilliseconds: number | any): DlDateTimeRangePickerModel {
    return this.getModel(moment(fromMilliseconds).startOf('month').valueOf(), selectedMilliseconds);
  }
}
