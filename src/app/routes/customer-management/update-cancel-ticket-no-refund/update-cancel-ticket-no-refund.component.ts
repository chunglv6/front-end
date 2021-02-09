import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ContractService, RESOURCE } from '@app/core';
import { AppStorage } from '@app/core/services/AppStorage';
import { TicketPurchaseHistoryService } from '@app/core/services/ticket-purchase-history/ticket-purchase-history.service';
import { ACTION_TYPE, BUY_TICKET, HTTP_CODE, TRANSACTION_STATUS } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { iif } from 'rxjs';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-update-cancel-ticket-no-refund',
  templateUrl: './update-cancel-ticket-no-refund.component.html',
  styleUrls: ['./update-cancel-ticket-no-refund.component.scss']
})
export class UpdateCancelTicketNoRefundComponent extends BaseComponent implements OnInit {
  contracts = [];
  constructor(
    private _contractService: ContractService,
    private _ticketPurchaseHistoryService: TicketPurchaseHistoryService,
    private _translateService: TranslateService,
    private _matDialog: MatDialog,
    private _toastrService: ToastrService
  ) {
    super(null, null, RESOURCE.CUSTOMER);
  }

  ngOnInit() {

    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order', width: '60px' },
      { i18n: 'customer-management.vehiclesNotRFIDTable.licensePlates', field: 'plateNumber' },
      { i18n: 'policy.stationPhase', field: 'stage' },
      { i18n: 'exchangeHistory.type_ticket', field: 'servicePlanTypeName' },
      { i18n: 'buyTicket.calculation', field: 'chargeMethodName' },
      { i18n: 'exchangeHistory.money', field: 'price', type: 'currency' },
      { i18n: 'buyTicket.register_Date', field: 'saleTransDate', type: 'datetime' },
      { i18n: 'common.fromDate', field: 'effDate', type: 'datetime' },
      { i18n: 'common.endDate', field: 'expDate', type: 'datetime' },
      { i18n: 'exchangeHistory.ghtd', field: 'autoRenew', type: 'custom' },
      { i18n: 'common.status', field: 'status' },
      { i18n: 'common.action', field: 'action', type: 'custom' },
    ];
    this.buildForm();

  }
  buildForm() {
    this.formSearch = new FormGroup({
      searchContract: new FormControl(),
    });
    this.formSearch.controls.searchContract.valueChanges
      .pipe(
        debounceTime(1000),
        tap(() => {
          this.searchModel.isLoadingContract = true;
          this.contracts = [];
        }),
        switchMap(value =>
          iif(
            () => typeof value !== 'object',
            this._contractService.searchContractInfo(value),
            null
          ).pipe(finalize(() => (this.searchModel.isLoadingContract = false)))
        )
      )
      .subscribe(rs => {
        this.contracts = rs.data.listData;
      });
  }
  displayFn(contract: any) {
    if (contract) {
      return contract.contractNo;
    }
  }
  onSelectedContract(event) {
    this.dataModel = event.option.value;
    this.getData();
  }
  getData() {
    this.isLoading = true;
    this._ticketPurchaseHistoryService.searchTicketHistories(this.dataModel.contractId, this.searchModel.startrecord, this.searchModel.pagesize).subscribe(rs => {
      if (rs.mess.code === HTTP_CODE.SUCCESS) {
        this.dataModel.dataSource = rs.data.listData;
        this.totalRecord = rs.data.count;
        this.dataModel.dataSource.map(d => {
          if (d.stageId) {
            const stageInfo = AppStorage.get('stages').find(x => x.id === d.stageId);
            d.stage = stageInfo?.name;
            d.stationInId = stageInfo?.stationInId;
            d.stationOutId = stageInfo?.stationOutId;
          }
          if (d.stationId) {
            const stationInfo = AppStorage.get('stations').find(x => x.id === d.stationId);
            d.stage = stationInfo?.name;
          }
          d.status =
            d.status === TRANSACTION_STATUS.UNPAID
              ? this._translateService.instant('exchangeHistory.unpaid')
              : d.status === TRANSACTION_STATUS.PAID_NO_INVOICE
                ? this._translateService.instant('exchangeHistory.paid_no_invoice')
                : d.status === TRANSACTION_STATUS.BILLED
                  ? this._translateService.instant('exchangeHistory.billed')
                  : this._translateService.instant('common.cancel');
          return d;
        });
        this.isLoading = false;
      }
    });
  }
  async renew(item) {
    const dialogData = new ConfirmDialogModel(
      this._translateService.instant('update-cancel-ticket-no-refund.title-popup-renew', { 0: item.servicePlanTypeName ?? '' }),
      this._translateService.instant('update-cancel-ticket-no-refund.mess-popup-renew', { 0: item.servicePlanTypeName ?? '' })
    );
    const dialogRef = this._matDialog.open(ConfirmDialogComponent, {
      width: '25%',
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe(rs => {
      if (rs) {
        const body = {
          // actTypeId: ACTION_TYPE.HUY_VE_KHONG_HOAN_TIEN,
          // stationInId: item?.stationInId,
          // stationOutId: item?.stationOutId,
          // stationType: item?.stage ? BUY_TICKET.TRAM_MO : BUY_TICKET.TRAM_KIN,
        };
        this._ticketPurchaseHistoryService.registerAutoRenew(item.saleTransDetailId, body).subscribe(res => {
          if (res.mess.code === HTTP_CODE.SUCCESS) {
            this._toastrService.success(this._translateService.instant('update-cancel-ticket-no-refund.success-renew'));
            this.getData();
          } else {
            this._toastrService.warning(this._translateService.instant(res.mess.description));
          }
        }, (error) => {
          this._toastrService.error('common.500Error');
        });
      }
    });
  }
  async cancelAutoRenew(item) {
    const dialogData = new ConfirmDialogModel(
      this._translateService.instant('update-cancel-ticket-no-refund.title-popup-renew', { 0: item.servicePlanTypeName ?? '' }),
      this._translateService.instant('update-cancel-ticket-no-refund.mess-popup-cancel-renew', { 0: item.servicePlanTypeName ?? '' })
    );
    const dialogRef = this._matDialog.open(ConfirmDialogComponent, {
      width: '25%',
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe(rs => {
      if (rs) {
        const body = {
          // actTypeId: ACTION_TYPE.HUY_VE_KHONG_HOAN_TIEN,
          // stationInId: item?.stationInId,
          // stationOutId: item?.stationOutId,
          // stationType: item?.stage ? BUY_TICKET.TRAM_MO : BUY_TICKET.TRAM_KIN,
        };
        this._ticketPurchaseHistoryService.cancelAutoRenew(item.saleTransDetailId, body).subscribe(res => {
          if (res.mess.code === HTTP_CODE.SUCCESS) {
            this._toastrService.success(this._translateService.instant('update-cancel-ticket-no-refund.success-cancel-renew'));
            this.getData();
          } else {
            this._toastrService.warning(this._translateService.instant(res.mess.description));
          }
        }, (error) => {
          this._toastrService.error('common.500Error');
        });
      }
    });
  }
  async cancel(item) {
    const dialogData = new ConfirmDialogModel(
      this._translateService.instant('update-cancel-ticket-no-refund.title-popup-cancel', { 0: item.servicePlanTypeName ?? '' }),
      this._translateService.instant('update-cancel-ticket-no-refund.mess-popup-cancel', { 0: item.servicePlanTypeName ?? '' })
    );
    const dialogRef = this._matDialog.open(ConfirmDialogComponent, {
      width: '25%',
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe(rs => {
      if (rs) {
        const body = {
          actTypeId: ACTION_TYPE.HUY_VE_KHONG_HOAN_TIEN,
          stationInId: item?.stationInId,
          stationOutId: item?.stationOutId,
          stationType: item?.stage ? BUY_TICKET.TRAM_MO : BUY_TICKET.TRAM_KIN,
        };
        this._ticketPurchaseHistoryService.destroyTicketNotRefund(item.saleTransDetailId, body).subscribe(res => {
          if (res.mess.code === HTTP_CODE.SUCCESS) {
            this._toastrService.success(this._translateService.instant('cancel-ticket-refund.cancel-success'));
            this.getData();
          } else {
            this._toastrService.warning(this._translateService.instant(res.mess.description));
          }
        }, (error) => {
          this._toastrService.error('common.500Error');
        });
      }
    });
  }

}
