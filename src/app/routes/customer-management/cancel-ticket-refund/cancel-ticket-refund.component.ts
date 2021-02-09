import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ContractService, RESOURCE, VehicleService } from '@app/core';
import { AppStorage } from '@app/core/services/AppStorage';
import { TicketPurchaseHistoryService } from '@app/core/services/ticket-purchase-history/ticket-purchase-history.service';
import { BUY_TICKET, HTTP_CODE, SharedDirectoryService, TRANSACTION_STATUS } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { iif } from 'rxjs';
import { debounceTime, finalize, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-cancel-ticket-refund',
  templateUrl: './cancel-ticket-refund.component.html',
  styleUrls: ['./cancel-ticket-refund.component.scss'],
})
export class CancelTicketRefundComponent extends BaseComponent implements OnInit {
  constructor(
    private _contractService: ContractService,
    private matDialog: MatDialog,
    private _ticketPurchaseHistoryService: TicketPurchaseHistoryService,
    private _translateService: TranslateService,
    private _vehicleService: VehicleService,
    private _toastrService: ToastrService,
    private _sharedDirectoryService: SharedDirectoryService
  ) {
    super(null, null, RESOURCE.CUSTOMER);
  }
  contracts = [];
  index = 0;
  dataOptionStages = [];
  dataOptionStations = [];
  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'customer-management.vehiclesNotRFIDTable.licensePlates', field: 'plateNumber' },
      { i18n: 'policy.stationPhase', field: 'stage' },
      { i18n: 'exchangeHistory.type_ticket', field: 'servicePlanTypeName' },
      { i18n: 'buyTicket.calculation', field: 'chargeMethodName' },
      { i18n: 'exchangeHistory.money', field: 'price', type: 'currency' },
      { i18n: 'buyTicket.register_Date', field: 'saleTransDate', type: 'datetime' },
      { i18n: 'common.fromDate', field: 'effDate', type: 'datetime' },
      { i18n: 'common.endDate', field: 'expDate', type: 'datetime' },
      { i18n: 'exchangeHistory.ghtd', field: 'autoRenew' },
      { i18n: 'common.status', field: 'status' },
      { i18n: 'common.action', field: 'action', type: 'custom' },
    ];
    this.dataOptionStages = AppStorage.get('stages');
    this.dataOptionStations = AppStorage.get('stations');
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
    this.getListDocumentTypeByCustomer();
    this.getData();
  }
  getListDocumentTypeByCustomer() {
    this._sharedDirectoryService.getListDocumentTypeByCustomer(this.dataModel.custTypeId).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.dataModel.attachType = res.data.find(x => x.id == this.dataModel.documentTypeId)?.val;
      }
    });
  }
  getData() {
    this.isLoading = true;
    this._ticketPurchaseHistoryService.getTicketbyContractId(this.dataModel.contractId, this.searchModel.startrecord, this.searchModel.pagesize).subscribe(rs => {
      if (rs.mess.code === HTTP_CODE.SUCCESS) {
        this.dataModel.dataSource = rs.data.listData;
        this.totalRecord = rs.data.count;
        this.dataModel.dataSource.map(d => {
          if (d.stageId) {
            const stageInfo = this.dataOptionStages.find(x => x.id === d.stageId);
            d.stage = stageInfo.name;
            d.stationInId = stageInfo?.stationInId;
            d.stationOutId = stageInfo?.stationOutId;
          }
          if (d.stationId) {
            const stationInfo = this.dataOptionStations.find(x => x.id === d.stationId);
            d.stage = stationInfo.name;
          }
          d.autoRenew =
            d.autoRenew === '1'
              ? this._translateService.instant('common.yes')
              : this._translateService.instant('common.no');
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
  async cancel(item) {
    let mess = '';
    mess = (await this._translateService.get('cancel-ticket-refund.popup-destroy-message', { 0: item.servicePlanTypeName, 1: item.plateNumber }).toPromise());
    const dialogData = new ConfirmDialogModel(
      this._translateService.instant('cancel-ticket-refund.popup-title-header'),
      mess
    );
    const dialogRef = this.matDialog.open(ConfirmDialogComponent, {
      width: '25%',
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe(rs => {
      if (rs) {
        const body = {
          stationInId: item?.stationInId,
          stationOutId: item?.stationOutId,
          stationType: item?.stage ? BUY_TICKET.TRAM_MO : BUY_TICKET.TRAM_KIN,
        };
        this._vehicleService.cancelTicket(body, item.saleTransDetailId).subscribe(res => {
          if (res.mess.code === HTTP_CODE.SUCCESS) {
            this._toastrService.success(this._translateService.instant('cancel-ticket-refund.cancel-success'));
            this.getData();
          } else {
            this._toastrService.warning(this._translateService.instant(rs.mess.description));
          }
        }, (error) => {
          this._toastrService.error(this._translateService.instant('common.500Error'));
        });
      }
    });
  }
  changeTab(event) {
    this.index = event;
  }
}
