import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { finalize, forkJoin, Observable, switchMap } from 'rxjs';
import {
  GetProductsPaginatedOption,
  IProduct,
  ProductsQueries,
} from 'src/app/models/product.model';
import { GlobalStateService } from 'src/app/services/global-state.service';
import { ProductsService } from 'src/app/services/products.service';
import { ComfirmDeleteModalComponent } from '../../components/comfirm-delete-modal/comfirm-delete-modal.component';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
})
export class ProductsListComponent implements OnInit {
  products$: Observable<IProduct[]>;
  productsQueries: GetProductsPaginatedOption = {
    page: 1,
    limit: 10,
  };
  productsLength = 0;
  productsSelection: IProduct[] = [];

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
    private _globalStateService: GlobalStateService,
    private _dialog: MatDialog
  ) {
    this.products$ = this._productsService.products$;
    this.getProductsPaginated();
  }

  ngOnInit(): void {}

  setProductQueries(queries: ProductsQueries) {
    this.productsQueries = {
      ...this.productsQueries,
      ...queries,
    };
  }

  resetProductQueries() {
    this.productsQueries = {
      page: 1,
      limit: 10,
    };
  }

  getProductsPaginated() {
    this._globalStateService.setLoading(true);

    this._productsService
      .getProductsPaginated(this.productsQueries)
      .pipe(finalize(() => this._globalStateService.setLoading(false)))
      .subscribe((data) => {
        this._productsService.setProductsList(data.products);
        this.productsLength = data.total;
      });
  }

  resetProductsList() {
    this.productsSelection = [];
    this.resetProductQueries();
    this.getProductsPaginated();
  }

  // Handle paginator
  paginatorChange(event: PageEvent) {
    this.setProductQueries({
      page: event.pageIndex + 1,
      limit: event.pageSize,
    });

    this.getProductsPaginated();
  }

  // Handle selection
  isAllSelected(productsLength: number) {
    const numSelected = this.productsSelection.length;
    return numSelected === productsLength;
  }

  isSelected(productId: string) {
    return this.productsSelection.some((product) => product.id === productId);
  }

  masterToggle(products: IProduct[]) {
    if (this.isAllSelected(products.length)) {
      this.productsSelection = [];
      return;
    }

    this.productsSelection = [...products];
  }

  toggle(product: IProduct) {
    if (this.isSelected(product.id)) {
      let index: number;
      this.productsSelection.forEach((prod, i) =>
        prod.id === product.id ? (index = i) : null
      );
      this.productsSelection.splice(index!, 1);
      return;
    }

    this.productsSelection = [...this.productsSelection, product];
  }

  // Handle delete

  openConfirmDeleteModal() {
    const dialogRef = this._dialog.open(ComfirmDeleteModalComponent);
    dialogRef
      .afterClosed()
      .subscribe((result) => result && this.deleteProductsSelected());
  }

  deleteProductsSelected() {
    this._globalStateService.setLoading(true);

    const deleteProductApis = this.productsSelection.map((product) =>
      this._productsService.deleteProduct(product.id)
    );

    forkJoin(deleteProductApis)
      .pipe(finalize(() => this._globalStateService.setLoading(true)))
      .subscribe(() => {
        this.resetProductsList();
      });
  }

  announceSortChange(event: any) {}
}
