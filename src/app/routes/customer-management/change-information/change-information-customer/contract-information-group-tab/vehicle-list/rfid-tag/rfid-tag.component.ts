import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ValidationService } from '@app/shared/common/validation.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { MtxGridColumn } from '@ng-matero/extensions';

@Component({
  selector: 'app-rfid-tag',
  templateUrl: './rfid-tag.component.html',
})
export class RFIDTagComponent extends BaseComponent implements OnInit {
  columnsTotal: MtxGridColumn[];
  staffOptions = [];
  listData: any;
  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public dataDiaLog: any,
    public _dialogRef: MatDialogRef<RFIDTagComponent>
  ) {
    super();
  }

  ngOnInit() {
    this.buildForm();
    this.listData = this.dataDiaLog.data.map(x => x.plateNumber).join(',');
  }

  buildForm() {
    this.formSearch = this.fb.group({
      serialFrom: [
        '',
        [Validators.required, Validators.maxLength(50), ValidationService.cannotWhiteSpace, Validators.pattern('^[a-zA-Z0-9]+$')],
      ],
    });
  }

  onAssign() {
    const startRfidSerial = this.formSearch.controls.serialFrom.value;
    this._dialogRef.close(startRfidSerial);
  }
}
