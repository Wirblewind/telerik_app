import { Component } from '@angular/core';
import { ProductService } from './product.service';
import { SortDescriptor } from '@progress/kendo-data-query';
import { Observable } from 'rxjs';
import { GridDataResult, PageChangeEvent } from "@progress/kendo-angular-grid";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [ProductService]
})
export class AppComponent {
  title = 'telerik_app';
  
  public gridItems: Observable<GridDataResult> | undefined;
  public pageSize: number = 10;
  public skip: number = 0;
  public sortDescriptor: SortDescriptor[] = [];
  public filterTerm: number | null = null;


  constructor(private service: ProductService) {
  }

  public pageChange(event: PageChangeEvent): void {
      this.skip = event.skip;
      this.loadGridItems();
  }

  public handleSortChange(descriptor: SortDescriptor[]): void {
      this.sortDescriptor = descriptor;
      this.loadGridItems();
  }

  private loadGridItems(): void {
      this.gridItems = this.service.getProducts(
        this.skip,
        this.pageSize,
        this.sortDescriptor,
        this.filterTerm
      );
  }
}
