import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-comfirm-delete-modal',
  templateUrl: './comfirm-delete-modal.component.html',
  styleUrls: ['./comfirm-delete-modal.component.scss'],
})
export class ComfirmDeleteModalComponent implements OnInit {
  constructor(private _dialogRef: MatDialogRef<ComfirmDeleteModalComponent>) {}

  ngOnInit(): void {}

  onClose(cofirm = false) {
    this._dialogRef.close(cofirm);
  }
}
