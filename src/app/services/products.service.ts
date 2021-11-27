import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  GetProductsPaginatedOption,
  IProduct,
  IProductCreated,
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

  constructor(private _http: HttpClient, private _snackBar: MatSnackBar) {
    this.baseUrl = environment.apiUrl;
  }

  setProductsList(products: IProduct[]) {
    this.productsSubject$.next(products);
  }

  getProductsPaginated(
    option: GetProductsPaginatedOption
  ): Observable<IProduct[]> {
    const { page, limit, sort, order } = option;

    let params = new HttpParams().set('_page', page).set('_limit', limit);

    if (sort && order) {
      params = params.set('_sort', sort).set('_order', order);
    }

    return this._http
      .get<IProduct[]>(`${this.baseUrl}/products`, { params })
      .pipe(catchError(() => this.errorHandled()));
  }

  getProductDetail(productId: number): Observable<IProduct> {
    return this._http
      .get<IProduct>(`${this.baseUrl}/products/${productId}`)
      .pipe(catchError(() => this.errorHandled()));
  }

  createProduct(productCreated: IProductCreated): Observable<IProduct> {
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

  deleteProduct(productId: number) {
    return this._http
      .delete(`${this.baseUrl}/products/${productId}`)
      .pipe(catchError(() => this.errorHandled()));
  }

  errorHandled() {
    this._snackBar.open('Internal server error', undefined, {
      horizontalPosition: 'left',
    });
    return throwError(() => new Error('Internal server error'));
  }
}
