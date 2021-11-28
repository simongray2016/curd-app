import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorStatusDirective } from './color-status.directive';

@NgModule({
  declarations: [ColorStatusDirective],
  imports: [CommonModule],
  exports: [ColorStatusDirective],
})
export class SharesModule {}
