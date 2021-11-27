import { Component, OnInit } from '@angular/core';
import { finalize, Observable } from 'rxjs';
import {
  GetProductsPaginatedOption,
  IProduct,
} from 'src/app/models/product.model';
import { GlobalStateService } from 'src/app/services/global-state.service';
import { ProductsService } from 'src/app/services/products.service';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
})
export class ProductsListComponent implements OnInit {
  products$: Observable<IProduct[]>;

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

  ngOnInit(): void {
  }

  getProductsPaginated(option: GetProductsPaginatedOption) {
    this._globalStateService.setLoading(true);

    this._productsService
      .getProductsPaginated(option)
      .pipe(finalize(() => this._globalStateService.setLoading(false)))
      .subscribe((product) => this._productsService.setProductsList(product));
  }

  announceSortChange(event: any) {
    
  }
}
