/**
 * @license
 * Copyright 2013-present Dale Lotts All Rights Reserved.
 * http://www.dalelotts.com
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/dalelotts/angular-bootstrap-datetimepicker/blob/master/LICENSE
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as _moment from 'moment';
const moment = (_moment as any).default ? (_moment as any).default : _moment;
import { take } from 'rxjs/operators';
import { DlDateAdapter } from '../core/dl-date-adapter';
import { DlDateTimePickerChange } from './dl-date-time-picker-change';
import { DateButton } from './dl-date-time-picker-date-button';
import { DlDateTimeRangePickerModel, RangeDate } from './dl-date-time-picker-model';
import { DlModelProvider } from './dl-model-provider';
import { DlDayRangeModelProvider } from './dl-model-provider-day-range';
import { DlYearModelProvider } from './dl-model-provider-year';
import { DlMonthModelProvider } from './dl-model-provider-month';
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
 * Maps key codes to the model provider function name
 * that should be called to perform the action.
 *
 * @internal
 **/

const keyCodeToModelProviderMethod = {
  'ArrowDown': 'goDown',
  'ArrowLeft': 'goLeft',
  'ArrowRight': 'goRight',
  'ArrowUp': 'goUp',
  'Down': 'goDown',
  'End': 'goEnd',
  'Home': 'goHome',
  'Left': 'goLeft',
  'PageDown': 'pageDown',
  'PageUp': 'pageUp',
  'Right': 'goRight',
  'Up': 'goUp',
  33: 'pageUp',
  34: 'pageDown',
  35: 'goEnd',
  36: 'goHome',
  37: 'goLeft',
  38: 'goUp',
  39: 'goRight',
  40: 'goDown',
};


/**
 * List of view names for the calendar.
 *
 * This list must be in order from
 * smallest increment of time to largest increment of time.
 *
 * @internal
 **/
const VIEWS = [
  'minute',
  'hour',
  'day',
  'month',
  'year'
];

/**
 * Component that provides all of the user facing functionality of the date/time picker.
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: false,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: DlDateTimePickerRangeComponent,
      multi: true
    }
  ],
  standalone: false,
  selector: 'dl-date-time-picker-range',
  styleUrls: ['./dl-date-time-picker.component.scss'],
  templateUrl: './dl-date-time-picker-range.component.html',
})
export class DlDateTimePickerRangeComponent<RangeDate> implements OnChanges, OnInit, ControlValueAccessor {

  /**
   * Change listener callback functions registered
   * via `registerOnChange`
   * @internal
   **/
  private _changed: ((value: RangeDate) => void)[] = [];
  /**
   * Model for the current view.
   *
   * @internal
   **/
  _model?: DlDateTimeRangePickerModel;
  /**
   * Maps view name to the next view (the view for the next smallest increment of time).
   * @internal
   **/
  private _nextView = {
    'day': 'hour',
  };
  /**
   * Maps view name to the previous view (the view for the next largest increment of time).
   * @internal
   **/
  private _previousView = {
    'day': 'month',
  };
  /**
   * Touch listener callback functions registered
   * via `registerOnChange`
   * @internal
   **/
  private _touched: (() => void)[] = [];
  /**
   * Stores the selected value for this picker.
   * @internal
   **/
  private _value?: RangeDate | any = {
    startDate: '',
    endDate: '',
  };
  /**
   * Maps view name to the model provider for that view.
   * @internal
   **/
  private readonly _viewToModelProvider: {
    year: DlModelProvider;
    month: DlModelProvider;
    day: DlDayRangeModelProvider;
  };

  private dateRangeValue: any;
  /**
   * Emits when a `change` event when date/time is selected or
   * the value of the date/time picker changes.
   **/
  @Output()
  readonly valueChange = new EventEmitter<DlDateTimePickerChange<RangeDate>>();

  /**
   * Emits when a `date select` event when date/time is selected
   **/
  @Output()
  readonly change = new EventEmitter<DlDateTimePickerChange<RangeDate>>();


  /**
   * Specifies the classes used to display the left icon.
   *
   * This component uses OPENICONIC https://useiconic.com/open
   * by default but any icon library may be used.
   */
  @Input()
  leftIconClass: any = [
    'oi',
    'oi-chevron-left'
  ];
  /**
   * The highest view that the date/time picker can show.
   * Setting this to a view less than year could make it more
   * difficult for the end-user to navigate to certain dates.
   */
  @Input()
  maxView: 'day' | string = 'day';
  /**
   * The view that will be used for date/time selection.
   *
   * The default of `minute  means that selection will not happen
   * until the end-user clicks on a cell in the minute view.
   *
   * for example, if you want the end-user to select a only day (date),
   * setting `minView` to `day` will cause selection to happen when the
   * end-user selects a cell in the day view.
   *
   * NOTE: This must be set lower than or equal to `startView'
   */
  @Input()
  minView: 'day' | string = 'day';
  /**
   * The number of minutes between each `.dl-abdtp-minute` button.
   *
   * Must be greater than `0` and less than `60`.
   */
  @Input()
  minuteStep = 5;
  /**
   * Specifies the classes used to display the right icon.
   *
   * This component uses OPENICONIC https://useiconic.com/open
   * by default but any icon library may be used.
   */
  @Input()
  rightIconClass = [
    'oi',
    'oi-chevron-right'
  ];

  /* tslint:disable:member-ordering */
  /**
   *  Determine whether or not the `DateButton` is selectable by the end user.
   */
  @Input()
  selectFilter: (dateButton: DateButton, viewName: string) => boolean = () => true

  /**
   *  Start at the view containing startDate when no value is selected.
   */
  @Input()
  startDate?: number;

  /**
   * The initial view that the date/time picker will show.
   * The picker will also return to this view after a date/time
   * is selected.
   *
   * NOTE: This must be set lower than or equal to `maxView'
   */
  @Input()
  startView: 'day' | string = 'day';

  /**
   * Specifies the classes used to display the up icon.
   *
   * This component uses OPENICONIC https://useiconic.com/open
   * by default but any icon library may be used.
   */
  @Input()
  upIconClass = [
    'oi',
    'oi-chevron-top'
  ];

  /**
   * Used to construct a new instance of a date/time picker.
   *
   * @param _elementRef
   *  reference to this element.
   * @param _ngZone
   *  reference to an NgZone instance used to select the active element outside of angular.
   * @param _dateAdapter
   *  date adapter for the date type in the model.
   * @param dayRangeModelComponent
   *  provider for the day view model.
   */
  constructor(private _elementRef: ElementRef,
    private _ngZone: NgZone,
    public _dateAdapter: DlDateAdapter<RangeDate>,
    // @ts-ignore
    private dayRangeModelComponent: DlDayRangeModelProvider,
    // @ts-ignore
    private yearModelComponent: DlYearModelProvider,
    // @ts-ignore
    private monthModelComponent: DlMonthModelProvider,
  ) {

    this._viewToModelProvider = {
      year: yearModelComponent,
      month: monthModelComponent,
      day: dayRangeModelComponent
    };
  }

  /* tslint:enable:member-ordering */
  /**
   * Set's the model for the current view after applying the selection filter.
   *
   * @internal
   **/
  private set model(model: DlDateTimeRangePickerModel) {
    this._model = this.applySelectFilter(model);
  }

  /**
   * Returns `D` value of the date/time picker or undefined/null if no value is set.
   **/
  get value(): RangeDate | any {
    return this._value;
  }

  /**
   * Sets value of the date/time picker and emits a change event if the
   * new value is different from the previous value.
   **/
  set value(value: any) {
    if (value) {
      this._value = value;
      // @ts-ignore
      this.model = this._viewToModelProvider[this._model.viewName].getModel(this.getStartDate(), this.valueOf);
      this._changed.forEach(f => f(this._value));
      this.valueChange.emit(new DlDateTimePickerChange<RangeDate>(this._value));
    }
  }

  /**
   * Returns `milliseconds` value of the date/time picker or undefined/null if no value is set.
   **/
  get valueOf(): RangeDate | null {
    // @ts-ignore
    return this._dateAdapter.toRangeMilliseconds(this._value)
  }

  /**
   * Applies the `selectionFilter` by adding the `dl-abdtp-disabled`
   * class to any `DateButton` where `selectFilter` returned false.
   *
   * @param model
   *  the new model
   *
   * @returns
   *  the supplied model with zero or more `DateButton`'s
   *  having the `dl-abdtp-disabled` class set to `true` if the
   *  selection for that date should be disabled.
   *
   * @internal
   */
  private applySelectFilter(model: DlDateTimeRangePickerModel): DlDateTimeRangePickerModel {
    if (this.selectFilter) {
      model.rowsStart = model.rowsStart.map((row) => {
        row.cells.map((dateButton: DateButton) => {
          const disabled = !this.selectFilter(dateButton, model.viewName);
          // @ts-ignore
          dateButton.classes['dl-abdtp-disabled'] = disabled;
          if (disabled) {
            // @ts-ignore
            dateButton.classes['aria-disabled'] = true;
          }
          return dateButton;
        });
        return row;
      });

      model.rowsEnd = model.rowsEnd.map((row) => {
        row.cells.map((dateButton: DateButton) => {
          const disabled = !this.selectFilter(dateButton, model.viewName);
          // @ts-ignore
          dateButton.classes['dl-abdtp-disabled'] = disabled;
          if (disabled) {
            // @ts-ignore
            dateButton.classes['aria-disabled'] = true;
          }
          return dateButton;
        });
        return row;
      });
    }

    return model;
  }

  /**
   * Focuses the `.dl-abdtp-active` cell after the microtask queue is empty.
   * @internal
   **/
  private focusActiveCell() {
    this._ngZone.runOutsideAngular(() => {
      this._ngZone.onStable.asObservable().pipe(take(1)).subscribe(() => {
        this._elementRef.nativeElement.querySelector('.dl-abdtp-active').focus();
      });
    });
  }

  /**
   * Determines the start date for the picker.
   * @internal
   **/
  private getStartDate(): any {
    if (hasValue(this.dateRangeValue)) {
      // @ts-ignore
      const startOfView = moment(this._model.viewStartLabel, 'MMM YYYY').startOf('month').valueOf();
      // @ts-ignore
      const endOfView = moment(this._model.viewEndLabel, 'MMM YYYY').endOf('month').valueOf();
      const valueInRange = this.dateRangeValue >= startOfView && this.dateRangeValue <= endOfView;

      return !valueInRange ? this.dateRangeValue : startOfView;
    }
    if (hasValue(this.startDate)) {
      return this.startDate;
    }
    return moment().valueOf();
  }

  /**
   * Determine the start view for the picker
   * @returns
   *  the largest time increment view between the `minView` or `minute` view and the `startView` or `day` view.
   */
  private getStartView(): string {
    const startIndex = Math.max(VIEWS.indexOf(this.minView || 'minute'), VIEWS.indexOf(this.startView || 'day'));
    return VIEWS[startIndex];
  }

  /**
   * Calls all registered `touch` callback functions.
   * @internal
   **/
  public onTouch() {
    this._touched.forEach((onTouched) => onTouched());
  }

  /**
   * Receives configuration changes detected by Angular and passes the changes on
   * to the model providers so the provider is aware of any necessary configuration
   * changes (i.e. minuteStep)
   *
   * @param changes
   *  the input changes detected by Angular.
   */
  ngOnChanges(changes: SimpleChanges): void {
    Object.values(this._viewToModelProvider).forEach((provider: DlModelProvider) => provider.onChanges(changes));

    if (this._model) { // only update the model after ngOnInit has set it the first time.
      // @ts-ignore
      this.model = this._viewToModelProvider[this._model.viewName].getModel(this._model.activeDate, this.valueOf);
    }
  }

  /**
   * Sets the initial model.
   *
   * @internal
   **/
  ngOnInit(): void {
    // @ts-ignore
    this.model = this._viewToModelProvider[this.getStartView()].getModel(this.getStartDate(), this.valueOf);
  }

  /**
   * Handles click (and enter & space key down) events on the date elements.
   *
   * If the current view is the minimum view then the date value is selected
   * and the picker returns to the start view.
   *
   * Otherwise the picker displays the next view with the next
   * smallest time increment.
   *
   * @internal
   **/
  _onDateClick(dateButton: DateButton) {
    // @ts-ignore
    if (dateButton?.classes['dl-abdtp-disabled']) {
      return;
    }
    // @ts-ignore
    let nextView = this._nextView[this._model.viewName];
    // @ts-ignore
    const viewName = this._model.viewName;

    if ((this.minView || 'minute') === this._model?.viewName) {
      this.dateRangeValue = dateButton.value;
      const dateValue = this._dateAdapter.fromMilliseconds(dateButton.value);
      const dateStartValue = this._dateAdapter.fromMilliseconds(this._value.startDate);

      if (!this._value.startDate) {
        this._value.startDate = dateValue;
      } else if (!this._value.endDate) {
        if (dateValue <= dateStartValue) {
          this._value.startDate = dateValue;
          this._value.endDate = null;
        } else {
          this._value.endDate = dateValue;
        }
      } else {
        this._value.startDate = dateValue;
        this._value.endDate = null;
      }
      // this.value = this._dateAdapter.fromMilliseconds(dateButton.value);
      this.value = this._value;
      nextView = this.startView;
    }

    this.onTouch();

    this.change.emit(new DlDateTimePickerChange<RangeDate>(this.value, viewName));
  }

  /**
   * Handles click (and enter & space key down) events on the left button.
   *
   * Changes the displayed time range of the picker to the previous time range.
   * For example, in year view, the previous decade is displayed.
   *
   * @internal
   **/
  _onLeftClick() {
    // @ts-ignore
    this.model = this._viewToModelProvider[this._model.viewName].getModel(this._model.leftButton.value, this.valueOf);
    this.onTouch();
  }

  /**
   * Handles click (and enter & space key down) events on the up button.
   *
   * Changes the view of the picker to the next largest time increment.
   * For example, in day view, the next view displayed will be month view.
   *
   * @internal
   **/
  _onUpClick() {
    // @ts-ignore
    this.model = this._viewToModelProvider[this._previousView[this._model.viewName]].getModel(this._model.upButton.value, this.valueOf);
  }

  /**
   * Handles click (and enter & space key down) events on the right button.
   *
   * Changes the displayed time range of the picker to the next time range.
   * For example, in year view, the next decade is displayed.
   *
   * @internal
   **/
  _onRightClick() {
    // @ts-ignore
    this.model = this._viewToModelProvider[this._model.viewName].getModel(this._model.rightButton.value, this.valueOf);
    this.onTouch();
  }

  /**
   * Handles various key down events to move the `active date` around the calendar.
   *
   * @internal
   **/
  _handleKeyDown($event: KeyboardEvent): void {
    // @ts-ignore
    const functionName = keyCodeToModelProviderMethod[$event.key];

    if (functionName) {
      // @ts-ignore
      const modelProvider = this._viewToModelProvider[this._model.viewName];
      this.model = modelProvider[functionName](this._model?.activeDate, this.valueOf);

      this.focusActiveCell();
      // Prevent unexpected default actions such as form submission.
      $event.preventDefault();
    }
  }

  /**
   * Implements ControlValueAccessor.registerOnChange to register change listeners.
   * @internal
   **/
  registerOnChange(fn: (value: RangeDate) => void) {
    this._changed.push(fn);
  }

  /**
   * Implements ControlValueAccessor.registerOnTouched to register touch listeners.
   * @internal
   **/
  registerOnTouched(fn: () => void) {
    this._touched.push(fn);
  }

  /**
   * Implements ControlValueAccessor.writeValue to store the value from the model.
   * @internal
   **/
  writeValue(value: RangeDate) {
    // if (value) {
    this.value = value;
    // }
  }

}

/** @internal */
function hasValue(value: any): boolean {
  return (typeof value !== 'undefined') && (value !== null) && (value !== '');
}
