import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TicketPurchaseHistoryService } from '@app/core/services/ticket-purchase-history/ticket-purchase-history.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ACTION_TYPE, BOT_COMFIRM, HTTP_CODE, TRANSACTION_STATUS } from '@app/shared/constant/common.constant';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cancel-detail',
  templateUrl: './cancel-detail.component.html',
  styleUrls: ['./cancel-detail.component.scss'],
})
export class CancelDetailComponent extends BaseComponent implements OnInit {
  transactionStatus = TRANSACTION_STATUS;
  botComfirm = BOT_COMFIRM;
  constructor(
    private _ticketPurchaseHistoryService: TicketPurchaseHistoryService,
    private _toastrService: ToastrService,
    private _translateService: TranslateService,
    private _dialogRef: MatDialogRef<CancelDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public dataDialog?: any,
  ) {
    super();
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'customer-management.vehiclesNotRFIDTable.licensePlates', field: 'plateNumber' },
      { i18n: 'policy.stationPhase', field: 'stationStagename' },
      { i18n: 'exchangeHistory.type_ticket', field: 'ticketTypeName' },
      { i18n: 'exchangeHistory.money', field: 'price', type: 'currency' },
      { i18n: 'buyTicket.register_Date', field: 'createDate', type: 'datetime' },
      { i18n: 'common.fromDate', field: 'effDate', type: 'datetime' },
      { i18n: 'common.endDate', field: 'expDate', type: 'datetime' },
      { i18n: 'common.status', field: 'status', type: 'custom' },
    ];
    this.buildForm();
    this.getData();
  }
  buildForm() {
    this.formSearch = new FormGroup({
      botComfirm: new FormControl(Validators.required),
      reason: new FormControl('', Validators.required),
      documentNumber: new FormControl(),
      refundDate: new FormControl(new Date(), Validators.required),
    });
  }
  getData() {
    this.dataModel.dataSource = [];
    this.dataModel.dataSource.push(this.dataDialog);
  }
  save() {
    const body = {
      botStatus: Number(this.formSearch.controls.botComfirm.value),
      actTypeId: ACTION_TYPE.HUY_VE_CO_HOAN_TIEN,
      botConfirmContent: this.formSearch.controls.reason.value,
      botConfirmDate: this.formSearch.controls.refundDate.value
    };
    this._ticketPurchaseHistoryService.destroyTicketRefund(this.dataDialog.subscriptionTicketId, body).subscribe(rs => {
      if (rs.mess.code === HTTP_CODE.SUCCESS) {
        this._toastrService.success(this._translateService.instant('cancel-ticket-refund.cancel-success'));
        this._dialogRef.close(true);
      } else {
        this._toastrService.warning(this._translateService.instant(rs.mess.description));
      }
    });
  }
}
