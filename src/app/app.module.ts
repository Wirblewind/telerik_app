import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { GridModule } from '@progress/kendo-angular-grid';
import { HomeComponent } from './pages/home/home.component';
import { SideNavigationMenuComponent } from './shared/side-navigation-menu/side-navigation-menu.component';
import { ListBoxModule } from "@progress/kendo-angular-listbox";
import { HttpClientModule } from '@angular/common/http';
import { TreeViewModule } from '@progress/kendo-angular-treeview';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { TasksComponent } from './pages/tasks/tasks.component';
import { EditorModule } from '@progress/kendo-angular-editor';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DropDownListModule, DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { FormsModule } from '@angular/forms';
import { ChartModule } from '@progress/kendo-angular-charts';
import "hammerjs";
import { LayoutModule } from '@progress/kendo-angular-layout';
import { ButtonsModule } from '@progress/kendo-angular-buttons';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SideNavigationMenuComponent,
    TasksComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DateInputsModule,
    GridModule,
    ListBoxModule,
    HttpClientModule,
    TreeViewModule,
    BrowserAnimationsModule,
    InputsModule,
    DropDownListModule,
    FormsModule,
    ChartModule,
    LayoutModule,
    ButtonsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
