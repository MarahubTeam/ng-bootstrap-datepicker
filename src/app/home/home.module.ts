import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DlDateTimeDateModule, DlDateTimePickerModule } from 'projects/bootstrap-datepicker/src/public-api';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './home.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DlDateTimeDateModule,
    DlDateTimePickerModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    HomeComponent,
  ],
})
export class HomeModule {
}
