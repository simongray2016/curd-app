import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  delay,
  map,
  Observable,
  of,
  throwError,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  GetProductsPaginatedOption,
  IProduct,
  ProductCreated,
} from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  baseUrl: string;

  private productsSubject$ = new BehaviorSubject<IProduct[]>([]);

  get products$(): Observable<IProduct[]> {
    return this.productsSubject$.asObservable();
  }

  get products(): IProduct[] {
    return this.productsSubject$.value;
  }

  constructor(private _http: HttpClient, private _snackBar: MatSnackBar) {
    this.baseUrl = environment.apiUrl;
  }

  setProductsList(products: IProduct[]) {
    this.productsSubject$.next(products);
  }

  getProductsPaginated(option: GetProductsPaginatedOption): Observable<{
    total: number;
    products: IProduct[];
  }> {
    const { page, limit, sort, order, search, category, status } = option;

    let params = new HttpParams().set('_page', page).set('_limit', limit);

    if (sort && order) {
      params = params.set('_sort', sort).set('_order', order);
    }

    if (search) {
      params = params.set('q', search);
    }

    if (category) {
      params = params.set('category', category);
    }

    if (status) {
      params = params.set('status', status);
    }

    return this._http
      .get<IProduct[]>(`${this.baseUrl}/products`, {
        params,
        observe: 'response',
      })
      .pipe(
        delay(500),
        map((res: HttpResponse<IProduct[]>) => ({
          total: parseInt(res.headers.get('X-Total-Count') ?? '0'),
          products: res.body ?? [],
        })),
        catchError(() => this.errorHandled())
      );
  }

  getProductDetail(productId: number): Observable<IProduct> {
    return this._http
      .get<IProduct>(`${this.baseUrl}/products/${productId}`)
      .pipe(catchError(() => this.errorHandled()));
  }

  createProduct(productCreated: ProductCreated): Observable<IProduct> {
    return this._http
      .post<IProduct>(`${this.baseUrl}/products/`, { ...productCreated })
      .pipe(catchError(() => this.errorHandled()));
  }

  editProduct(product: IProduct): Observable<IProduct> {
    return this._http
      .put<IProduct>(`${this.baseUrl}/products/${product.id}`, {
        product,
      })
      .pipe(catchError(() => this.errorHandled()));
  }

  deleteProduct(productId: string) {
    return this._http
      .delete(`${this.baseUrl}/products/${productId}`)
      .pipe(catchError(() => of(null)));
  }

  errorHandled() {
    this._snackBar.open('Internal server error', undefined, {
      horizontalPosition: 'left',
    });
    return throwError(() => new Error('Internal server error'));
  }
}
