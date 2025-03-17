/**
 * @license
 * Copyright 2013-present Dale Lotts All Rights Reserved.
 * http://www.dalelotts.com
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/dalelotts/angular-bootstrap-datetimepicker/blob/master/LICENSE
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DlDateTimePickerComponent } from './dl-date-time-picker.component';
import { DlDateTimePickerRangeComponent } from './dl-date-time-picker-range.component';
import { DlDayModelProvider } from './dl-model-provider-day';
import { DlHourModelProvider } from './dl-model-provider-hour';
import { DlMinuteModelProvider } from './dl-model-provider-minute';
import { DlMonthModelProvider } from './dl-model-provider-month';
import { DlYearModelProvider } from './dl-model-provider-year';
import { DlDayRangeModelProvider } from './dl-model-provider-day-range';

/**
 * Import this module to supply your own `DateAdapter` provider.
 * @internal
 **/
@NgModule({
  declarations: [DlDateTimePickerComponent, DlDateTimePickerRangeComponent],
  imports: [CommonModule],
  exports: [DlDateTimePickerComponent, DlDateTimePickerRangeComponent],
  providers: [
    DlYearModelProvider,
    DlMonthModelProvider,
    DlDayModelProvider,
    DlHourModelProvider,
    DlMinuteModelProvider,
    DlDayRangeModelProvider,
  ],
})
export class DlDateTimePickerModule {
}
