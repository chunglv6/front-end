import { BaseComponent } from './../../../../shared/components/base-component/base-component.component';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { VehicleService } from '@app/core';
import { AppStorage } from '@app/core/services/AppStorage';
import { BOT_COMFIRM, HTTP_CODE } from '@app/shared';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { CancelDetailComponent } from '../cancel-detail/cancel-detail.component';

@Component({
  selector: 'app-requied-refund',
  templateUrl: './requied-refund.component.html',
  styleUrls: ['./requied-refund.component.scss'],
})
export class RequiedRefundComponent extends BaseComponent implements OnChanges, OnInit {
  @Input() infoContract: any;
  dataOptionStages = [];
  dataOptionStations = [];
  dataOptionTicketType = [];
  dataOptionMethodCharge = [];
  constructor(
    private _vehicleService: VehicleService,
    private _translateService: TranslateService,
    private _matDialog: MatDialog,
  ) {
    super();
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.getData();
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'customer-management.vehiclesNotRFIDTable.licensePlates', field: 'plateNumber' },
      { i18n: 'policy.stationPhase', field: 'stationStagename' },
      { i18n: 'exchangeHistory.boo', field: 'booCode' },
      { i18n: 'exchangeHistory.type_ticket', field: 'ticketTypeName' },
      { i18n: 'buyTicket.calculation', field: 'methodChargeName' },
      { i18n: 'exchangeHistory.money', field: 'price', type: 'currency' },
      { i18n: 'buyTicket.register_Date', field: 'createDate', type: 'datetime' },
      { i18n: 'common.fromDate', field: 'effDate', type: 'datetime' },
      { i18n: 'common.endDate', field: 'expDate', type: 'datetime' },
      { i18n: 'exchangeHistory.status_req', field: 'statusReq' },
      { i18n: 'exchangeHistory.status_bot', field: 'statusBot' },
      { i18n: 'common.action', field: 'function', type: 'custom' },
    ];
    this.dataOptionStages = AppStorage.get('stages');
    this.dataOptionStations = AppStorage.get('stations');
    this.dataOptionTicketType = AppStorage.get('ticket');
    this.dataOptionMethodCharge = AppStorage.get('methodCharge');
  }
  request(item) {
    const dialogRef = this._matDialog.open(CancelDetailComponent, {
      width: '60%',
      data: item,
    });
    dialogRef.afterClosed().subscribe(rs => {
      if (rs) {
        this.getData();
      }
    });
  }

  getData() {
    this.isLoading = true;
    this._vehicleService.searchHistoryVehicleTicketRequest(this.infoContract.contractId, this.searchModel.pagesize, this.searchModel.startrecord).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        this.totalRecord = res.data.count;
        this.dataModel.dataSource = res.data.listData.map(x => {
          if (x.stationId) {
            x.stationStagename = this.dataOptionStations.find(n => n.id === x.stationId)?.name;
          } else if (x.stationId) {
            x.stationStagename = this.dataOptionStages.find(n => n.id === x.stageId)?.name;
          }
          x.ticketTypeName = this.dataOptionTicketType.find(n => n.servicePlanTypeId === x.servicePlanTypeId)?.name;
          x.methodChargeName = this.dataOptionMethodCharge.find(n => n.code === x.methodChargeId)?.val;
          x.statusReq = x.status === BOT_COMFIRM.RECEIVED ? this._translateService.instant('cancel-ticket-refund.pending')
            : x.status === BOT_COMFIRM.SUCCESS ? this._translateService.instant('search-information.success')
              : x.status === BOT_COMFIRM.REJECT ? this._translateService.instant('briefcase.denial') : '';
          x.statusBot = x.botstatus === BOT_COMFIRM.RECEIVED ? this._translateService.instant('cancel-ticket-refund.remaining')
            : x.botstatus === BOT_COMFIRM.SUCCESS ? this._translateService.instant('cancel-ticket-refund.yes')
              : x.botstatus === BOT_COMFIRM.REJECT ? this._translateService.instant('cancel-ticket-refund.no') : '';
          return x;
        });
        this.isLoading = false;
      }
    });
  }
}
