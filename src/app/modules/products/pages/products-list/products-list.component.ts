import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, finalize, Observable, Subject } from 'rxjs';
import {
  GetProductsPaginatedOption,
  IProduct,
  ProductsQueries,
} from 'src/app/models/product.model';
import { GlobalStateService } from 'src/app/services/global-state.service';
import { ProductsService } from 'src/app/services/products.service';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
})
export class ProductsListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: false }) paginator?: MatPaginator;

  products$: Observable<IProduct[]>;
  productsQueries: GetProductsPaginatedOption = {
    page: 1,
    limit: 10,
  };
  productsLength = 0;

  readonly pageSizeDefault = 1;
  displayedColumns = [
    'selection',
    'img',
    'name',
    'price',
    'stock',
    'created date',
    'category',
    'status',
    'action',
  ];

  constructor(
    private _productsService: ProductsService,
    private _globalStateService: GlobalStateService
  ) {
    this.products$ = this._productsService.products$;
    this.getProductsPaginated({ page: 1, limit: 20 });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  setProductQueries(queries: ProductsQueries) {
    this.productsQueries = {
      ...this.productsQueries,
      ...queries,
    };
  }

  getProductsPaginated(option: GetProductsPaginatedOption) {
    this._globalStateService.setLoading(true);

    this._productsService
      .getProductsPaginated(option)
      .pipe(finalize(() => this._globalStateService.setLoading(false)))
      .subscribe((data) => {
        this._productsService.setProductsList(data.products);
        this.productsLength = data.total;
      });
  }

  paginatorChange(event: PageEvent) {
    this.setProductQueries({
      page: event.pageIndex + 1,
      limit: event.pageSize,
    });

    this.getProductsPaginated(this.productsQueries);
  }

  announceSortChange(event: any) {}
}
