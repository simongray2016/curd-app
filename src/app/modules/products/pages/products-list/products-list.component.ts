import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import {
  catchError,
  debounceTime,
  finalize,
  forkJoin,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { intersectionBy } from 'lodash';
import {
  ECategory,
  EStatus,
  GetProductsPaginatedOption,
  IProduct,
  ProductsQueries,
} from 'src/app/models/product.model';
import { GlobalStateService } from 'src/app/services/global-state.service';
import { ProductsService } from 'src/app/services/products.service';
import { ComfirmDeleteModalComponent } from '../../components/comfirm-delete-modal/comfirm-delete-modal.component';
import { Sort } from '@angular/material/sort';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
})
export class ProductsListComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<null>();
  products$: Observable<IProduct[]>;
  productsQueries: GetProductsPaginatedOption = {
    page: 1,
    limit: 10,
  };
  productsLength = 0;
  productsSelection: IProduct[] = [];
  searchProductControl = new FormControl('');
  filterFormGroup: FormGroup;
  displayedColumns = [
    'selection',
    'img',
    'name',
    'price',
    'stock',
    'createAt',
    'category',
    'status',
    'action',
  ];
  categories = Object.values(ECategory);
  statuses = Object.values(EStatus);

  constructor(
    private _productsService: ProductsService,
    private _globalStateService: GlobalStateService,
    private _dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _router: Router,
    private _route: ActivatedRoute
  ) {
    this.filterFormGroup = this._formBuilder.group({
      category: [''],
      status: [''],
    });
    this.products$ = this._productsService.products$;
    this.getProductsPaginated();
  }

  ngOnInit(): void {
    this.listenSearchControl();
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
  }

  // Search
  listenSearchControl() {
    this.searchProductControl.valueChanges
      .pipe(
        debounceTime(200),
        takeUntil(this.destroy$),
        tap(() => this._globalStateService.setLoading(true)),
        switchMap((search: string) => {
          this.setProductQueries({ search });

          return this._productsService.getProductsPaginated(
            this.productsQueries
          );
        }),
        catchError(() => of(null))
      )
      .subscribe((data) => {
        this._globalStateService.setLoading(false);
        if (data !== null) {
          this._productsService.setProductsList(data.products);
          this.productsLength = data.total;
        }
      });
  }

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

        // Filter selected items in new products list when get new products
        this.intersectSelectionAndProducts();
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

  // Filter selected items in new products list when get new products
  intersectSelectionAndProducts() {
    this.productsSelection = intersectionBy(
      this.productsSelection,
      this._productsService.products,
      'id'
    );
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
      .pipe(finalize(() => this._globalStateService.setLoading(false)))
      .subscribe(() => {
        this.pushNotification('You have deleted products selected');
        this.resetProductsList();
      });
  }

  deleteProduct(productId: string) {
    this._globalStateService.setLoading(true);
    this._productsService
      .deleteProduct(productId)
      .pipe(finalize(() => this._globalStateService.setLoading(false)))
      .subscribe(() => {
        this.pushNotification('You have deleted product');
        this.getProductsPaginated();
      });
  }

  // Sort
  announceSortChange(event: Sort) {
    if (event.direction) {
      this.setProductQueries({ sort: event.active, order: event.direction });
    } else {
      this.setProductQueries({ sort: undefined, order: undefined });
    }

    this.getProductsPaginated();
  }

  // Filter
  resetFilter() {
    this.filterFormGroup.reset();
    this.setProductQueries({ category: undefined, status: undefined });
    this.getProductsPaginated();
  }

  applyFilter() {
    const { category, status } = this.filterFormGroup.value;

    if (category || status) {
      this.setProductQueries({
        category: category || undefined,
        status: status || undefined,
      });

      this.getProductsPaginated();
    }
  }

  // Snack bar
  pushNotification(message: string) {
    this._snackBar.open(message, undefined, {
      horizontalPosition: 'left',
    });
  }

  goToProductDetail(productId: string) {
    this._router.navigate(['view', productId], { relativeTo: this._route });
  }

  goToCreateProduct() {
    this._router.navigate(['create'], { relativeTo: this._route });
  }
}
