import {
  Directive,
  ElementRef,
  HostBinding,
  Input,
  OnInit,
} from '@angular/core';
import { EStatus } from '../models/product.model';

@Directive({
  selector: '[color-status]',
})
export class ColorStatusDirective implements OnInit {
  @HostBinding('class') classes = ' py-1 px-2 w-auto rounded-md';
  @Input('color-status') colorStatus = '';

  constructor(private _elm: ElementRef) {}

  ngOnInit() {
    this.addStyleStatus();
  }

  addStyleStatus() {
    switch (this.colorStatus) {
      case EStatus.active:
        this._elm.nativeElement.classList.add('text-green-500', 'bg-green-200');
        break;
      case EStatus.suspended:
        this._elm.nativeElement.classList.add(
          'text-yellow-500',
          'bg-yellow-200'
        );
        break;
      case EStatus.expriring:
        this._elm.nativeElement.classList.add('text-red-500', 'bg-red-200');
        break;
      default:
        break;
    }
  }
}
