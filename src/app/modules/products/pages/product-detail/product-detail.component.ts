import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { finalize, of, switchMap } from 'rxjs';
import {
  ECategory,
  EStatus,
  ProductFormBody,
} from 'src/app/models/product.model';
import { GlobalStateService } from 'src/app/services/global-state.service';
import { ProductsService } from 'src/app/services/products.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {
  productFormGroup!: FormGroup;
  productId?: string;
  statuses: EStatus[] = Object.values(EStatus);
  categories: ECategory[] = Object.values(ECategory);

  get imgUrl() {
    return this.productFormGroup.controls['imgUrl']?.value ?? '';
  }

  get name() {
    return this.productFormGroup.controls['name'];
  }

  get category() {
    return this.productFormGroup.controls['category'];
  }

  get status() {
    return this.productFormGroup.controls['status'];
  }

  constructor(
    private _route: ActivatedRoute,
    private _productsService: ProductsService,
    private _globalStateService: GlobalStateService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _snackBar: MatSnackBar
  ) {
    this.buildFormGroup();
    this.getProductDetail();
  }

  ngOnInit(): void {}

  buildFormGroup() {
    this.productFormGroup = this._formBuilder.group({
      category: ['', [Validators.required]],
      createAt: [new Date()],
      description: [''],
      imgUrl: [''],
      material: [''],
      name: ['', [Validators.required]],
      price: [0],
      status: ['', [Validators.required]],
      stock: 0,
    });
  }

  getProductDetail() {
    this._route.paramMap
      .pipe(
        switchMap((paramMap: ParamMap) => {
          if (paramMap.get('id')) {
            this._globalStateService.setLoading(true);
            this.productId = paramMap.get('id')!;
            return this._productsService.getProductDetail(this.productId);
          }
          return of(null);
        })
      )
      .subscribe((product) => {
        this._globalStateService.setLoading(false);
        if (product) {
          this.productFormGroup.setValue(
            {
              category: product.category,
              createAt: product.createAt,
              description: product.description,
              imgUrl: product.imgUrl,
              material: product.material,
              name: product.name,
              price: product.price,
              status: product.status,
              stock: product.stock,
            },
            { emitEvent: false }
          );

          this.productFormGroup.markAsUntouched();
        }
      });
  }

  submitForm() {
    if (this.productFormGroup.valid) {
      const body: ProductFormBody = this.productFormGroup.value;

      if (this.productId) {
        this.editProduct(body);
      } else {
        this.createProduct(body);
      }
    }
  }

  editProduct(body: ProductFormBody) {
    this._globalStateService.setLoading(true);
    this._productsService
      .editProduct(this.productId!, body)
      .pipe(finalize(() => this._globalStateService.setLoading(false)))
      .subscribe(() => {
        this.pushNotification('You have updated product');
        this.goBack();
      });
  }

  createProduct(body: ProductFormBody) {
    this._globalStateService.setLoading(true);
    this._productsService
      .createProduct(body)
      .pipe(finalize(() => this._globalStateService.setLoading(false)))
      .subscribe(() => {
        this.pushNotification('You have created product');
        this.goBack();
      });
  }

  // Snack bar
  pushNotification(message: string) {
    this._snackBar.open(message, undefined, {
      horizontalPosition: 'left',
    });
  }

  cancel() {
    this.goBack();
  }

  goBack() {
    this._router.navigate(['/products']);
  }
}
