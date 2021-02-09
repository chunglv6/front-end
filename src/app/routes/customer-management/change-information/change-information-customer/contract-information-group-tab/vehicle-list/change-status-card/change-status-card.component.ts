import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { CommonCRMService } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ACTION_TYPE, LIST_FUNC } from '@app/shared/constant/common.constant';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-change-status-card',
  templateUrl: './change-status-card.component.html',
  styleUrls: ['./change-status-card.component.css'],
})
export class ChangeStatusCardComponent extends BaseComponent implements OnInit {
  constructor(
    protected _translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private _commonCRMService: CommonCRMService,
    public dialogOpen: MatDialogRef<ChangeStatusCardComponent>
  ) {
    super();
  }
  reasonForm: FormGroup;
  dataReasonType: any;
  @ViewChild(MatTable) tableFee: MatTable<any>;
  actionType: number;
  fee;
  header;
  totalCost = 0;
  ngOnInit() {
    this.buildForm();
    this.displayedColumns = ['fee', 'price'];
    if (this.data.data.status === LIST_FUNC.KICHHOATTHE) {
      this.actionType = ACTION_TYPE.KICHHOATTHE;
      this.header =
        this._translate.instant('common.active-card-popup-title') +
        ' ' +
        this.data.data.item.plateNumber;
    }
    if (this.data.data.status === LIST_FUNC.MOTHE) {
      this.actionType = ACTION_TYPE.MOTHE;
      this.header =
        this._translate.instant('common.open-card-popup-title') +
        ' ' +
        this.data.data.item.plateNumber;
    }
    if (this.data.data.status === LIST_FUNC.KHOATHE) {
      this.actionType = ACTION_TYPE.KHOATHE;
      this.header =
        this._translate.instant('common.lock-card-popup-title') +
        ' ' +
        this.data.data.item.plateNumber;
    }
    if (this.data.data.status === LIST_FUNC.HUYTHE) {
      this.actionType = ACTION_TYPE.HUYTHE;
      this.header =
        this._translate.instant('common.cancel-card-popup-title') +
        ' ' +
        this.data.data.item.plateNumber;
    }
    this.bindData();
  }
  buildForm() {
    this.reasonForm = this.fb.group({
      reason: ['', Validators.required],
    });
  }
  async bindData() {
    await this.getFees();
    await this.getReason();
  }
  getFees() {
    this.dataModel.dataSource = [];
    this._commonCRMService.getFees(this.actionType).subscribe(res => {
      const feeType = {
        fee: this._translate.instant('contract.fee_change_title'),
        price: res.data.fee,
      };
      this.dataModel.dataSource.push(feeType);
      const feeTotal = {
        fee: this._translate.instant('contract.total_fee'),
        price: res.data.fee,
      };
      this.totalCost = res.data.fee;
      this.dataModel.dataSource = [...[feeType]];
    });
  }
  getReason() {
    this._commonCRMService.getReason(this.actionType).subscribe(res => {
      this.dataReasonType = res.data;
    });
  }
  onSave() {
    this.dialogOpen.close({ reason: this.reasonForm.controls.reason.value, fee: this.fee });
  }
}
