import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VehicleService } from '@app/core';
import { AppStorage } from '@app/core/services/AppStorage';
import { STATION_TYPE } from '@app/shared/constant/common.constant';
import { SharedDirectoryService } from '@app/shared/services/shared-directory.service';
import { COMMOM_CONFIG } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../base-component/base-component.component';
import { TRANSACTION_STATUS } from './../../constant/common.constant';

@Component({
  selector: 'app-buy-ticket-history',
  templateUrl: './buy-ticket-history.component.html',
  styleUrls: ['./buy-ticket-history.component.scss'],
})
export class BuyTicketHistoryComponent extends BaseComponent implements OnInit {
  stationTypeOptions = [];
  ticketTypeOptions = [];
  stagestationOpions = [];
  stationOpions = [];
  formatDate = COMMOM_CONFIG.DATE_FORMAT;
  totalMoney = 0;
  listStationType = STATION_TYPE;
  listMethodCharge = [];
  listMethodReCharge = [];
  rowsForm: FormArray = this.fb.array([]);
  constructor(
    private fb: FormBuilder,
    private _customeBuyticket: SharedDirectoryService,
    @Inject(MAT_DIALOG_DATA) public dataParent: any,
    private _vehicleService: VehicleService,
    private _translateService: TranslateService
  ) {
    super();
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'customer-management.vehiclesNotRFIDTable.licensePlates', field: 'plateNumber' },
      { i18n: 'policy.stationPhase', field: 'stageOrStation' },
      { i18n: 'buyTicket.ticket', field: 'servicePlanTypeName' },
      { i18n: 'buyTicket.calculation', field: 'chargeMethod' },
      { i18n: 'exchangeHistory.money', field: 'price', type: 'currency' },
      { i18n: 'buyTicket.register_Date', field: 'saleTransDate', type: 'datetime' },
      { i18n: 'common.fromDate', field: 'effDate', type: 'datetime' },
      { i18n: 'exchangeHistory.endTime', field: 'expDate', type: 'datetime' },
      { i18n: 'exchangeHistory.ghtd', field: 'autoRenew' },
      { i18n: 'buyTicket.method_Recharge', field: 'methodRecharge' },
      { i18n: 'common.status', field: 'status' },
    ];
    this.listMethodReCharge = [
      { value: 1, label: this._translateService.instant('buyTicket.cash') },
      { value: 2, label: this._translateService.instant('buyTicket.sub_ETC') },
      { value: 3, label: this._translateService.instant('buyTicket.link_conect') },
    ];
    this.listMethodCharge = AppStorage.get('method-charges');
    this.buildForm();
    this.bindDropdown();
  }

  buildForm() {
    this.formSearch = this.fb.group({
      station_type: ['', Validators.required],
      distance: ['', Validators.required],
      stationId: [''],
      stageId: [''],
      servicePlanTypeId: ['', Validators.required],
      pagesize: [this.pageSizeList[0]],
      startrecord: [0],
    });
  }
  async bindDropdown() {
    await this.getStationType();
    await this.getTicketType();
  }

  getStationType() {
    this._customeBuyticket.getStationType().subscribe(res => {
      this.stationTypeOptions = res.data;
      this.formSearch.controls.station_type.setValue(this.stationTypeOptions[0].code);
      const event = {
        value: this.formSearch.controls.station_type.value,
      };
      this.onChangeStationType(event);
    });
  }

  onChangeStationType(event) {
    this.formSearch.controls.distance.setValue(null);
    if (event.value === STATION_TYPE.TRAM_KIN) {
      this.getStages();
    } else {
      this.getStations();
    }
  }

  getStages() {
    this._customeBuyticket.getStages().subscribe(res => {
      this.stagestationOpions = res.data.listData;
    });
  }

  getStations() {
    this._customeBuyticket.getStations().subscribe(res => {
      this.stagestationOpions = res.data.listData;
    });
  }

  getTicketType() {
    this._customeBuyticket.getTicketType().subscribe(res => {
      this.ticketTypeOptions = res.data;
    });
  }

  getData() {
    if (this.formSearch.valid) {
      this.isLoading = true;
      if (this.formSearch.controls.station_type.value === STATION_TYPE.TRAM_KIN) {
        this.formSearch.controls.stageId.setValue(this.formSearch.controls.distance.value);
        this.formSearch.controls.stationId.setValue(null);
      } else {
        this.formSearch.controls.stationId.setValue(this.formSearch.controls.distance.value);
        this.formSearch.controls.stageId.setValue(null);
      }
      this._vehicleService
        .searchHistoryTransactionVehicle(this.formSearch.value, this.dataParent.data.item.vehicleId)
        .subscribe(res => {
          this.dataModel.dataSource = res.data.listData.map(d => {
            d.chargeMethod = this.listMethodCharge.find(c => c.code == d.chargeMethodId)?.val;
            d.autoRenew =
              d.autoRenew == '1'
                ? this._translateService.instant('common.yes')
                : this._translateService.instant('common.no');
            d.plateNumber = this.dataParent.data.item.plateNumber;
            d.stageOrStation = d.station || d.stage;
            d.status = d.status == TRANSACTION_STATUS.UNPAID
              ? this._translateService.instant('exchangeHistory.unpaid')
              : d.status == TRANSACTION_STATUS.PAID_NO_INVOICE
                ? this._translateService.instant('exchangeHistory.paid_no_invoice')
                : d.status == TRANSACTION_STATUS.BILLED
                  ? this._translateService.instant('exchangeHistory.billed')
                  : this._translateService.instant('common.cancel');
            return d;
          });
          this.isLoading = false;
          this.totalRecord = res.data.count;
          this.totalMoney = this.dataModel.dataSource.reduce((x, y) => x + y.price, 0);

        });
    }
  }

  // onEdit(row) {
  //   row.expDate = moment(row.expDate, COMMOM_CONFIG.DATE_FORMAT).toDate();
  //   row.isEdit = true;
  // }

  // onSave(row: any, index: number) {
  //   row.isEdit = false;
  //   row.expDate = moment(this.rowsForm.value[index].effDateForm).format(COMMOM_CONFIG.DATE_FORMAT);
  // }

  // onBuyTicket() {
  //   this._routeStore.sendToBuyTicket({ dataParent: this.dataParent });
  //   this._router.navigate(['customer-management', 'buy-ticket']);
  //   this._dialogRef.close();
  // }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.formSearch.controls.startrecord.setValue(
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.formSearch.controls.pagesize.setValue(event.pageSize);
    this.getData();
  }

  // search thì back về page 1
  onSearch() {
    this.pageIndex = 0;
    this.formSearch.controls.startrecord.setValue(0);
    this.getData();
  }
}
