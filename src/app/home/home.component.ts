import { Component } from '@angular/core';
import { DlDateTimePickerChange } from 'projects/bootstrap-datepicker/src/public-api';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: false
})
export class HomeComponent {

  maxView = 'year';
  minuteStep = 5;
  minView = 'minute';
  selectedDate: Date = new Date();
  showCalendar = true;
  startView = 'day';
  views = ['minute', 'hour', 'day', 'month', 'year'];


  today = new Date();
  tomorrow = new Date(new Date(this.today).setDate(this.today.getDate() + 1));

  selectedRangeDateValue: any = {
    startDate: this.today,
    endDate: this.tomorrow
  }

  constructor() {
    const tomorrow = new Date(new Date(this.today).setDate(this.today.getDate() + 5));
  }

  /**
   * Sample implementation of a `change` event handler.
   * @param event
   *  The change event.
   */

  onCustomDateChange(event: DlDateTimePickerChange<Date | any>) {
    console.log(event.value, 'onCustomDateChange');
  }

  /**
   * Determines whether or not the specified `minView` option is disabled (valid)
   * considering the current `startView` and `maxView` settings.
   * @param view
   * the target view value.
   */

  isMinViewDisabled(view: any) {
    return this.views.indexOf(view) > this.views.indexOf(this.startView)
      || this.views.indexOf(view) > this.views.indexOf(this.maxView);
  }

  /**
   * Determines whether or not the specified `maxView` option is disabled (valid)
   * considering the current `startView` and `minView` settings.
   * @param view
   * the target view value.
   */

  isMaxViewDisabled(view: any) {
    return this.views.indexOf(view) < this.views.indexOf(this.startView)
      || this.views.indexOf(view) < this.views.indexOf(this.minView);
  }

  /**
   * Determines whether or not the specified `startView` option is disabled (valid)
   * considering the current `minView` and `maxView` settings.
   * @param view
   * the target view value.
   */

  isStartViewDisabled(view: any) {
    return this.views.indexOf(this.minView) > this.views.indexOf(view)
      || this.views.indexOf(this.maxView) < this.views.indexOf(view);
  }

  /**
   * Removes/Adds the picker from the DOM forcing a re-render when
   * the `starView` value changes.
   */

  refresh() {
    this.showCalendar = false;
    setTimeout(() => this.showCalendar = true, 100);
  }
}
