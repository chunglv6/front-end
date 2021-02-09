import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContractService, RESOURCE, VehicleService } from '@app/core';
import { AppStorage } from '@app/core/services/AppStorage';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import {
  HTTP_CODE,
  STATUS_RFID_VEHICLE,
  STATUS_VEHICLE,
} from '@app/shared/constant/common.constant';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog, MtxGridColumn } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { FormControl } from '@angular/forms';
import { BuyTicketHistoryComponent } from '@shared/components/buy-ticket-history/buy-ticket-history.component';

@Component({
  selector: 'app-contract-vehicle-list',
  templateUrl: './contract-vehicle-list.component.html',
  styleUrls: ['./contract-vehicle-list.component.css'],
})
export class ContractVehicleListComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() contractId: number;
  columnsWithRFID: any[] = [];
  isLoadingRFID = true;
  searchModelRFID: any = {};
  activeStatus = STATUS_RFID_VEHICLE;
  statusVehicle = STATUS_VEHICLE;
  startRecordRFID = 0;
  pageSizeRFID = 10;
  indexRFID = 0;
  startFrom = new FormControl();
  endFrom = new FormControl();
  startRFIDFrom = new FormControl();
  endRFIDFrom = new FormControl();
  constructor(
    protected _vehicleService: VehicleService,
    public actr: ActivatedRoute,
    public _translateService: TranslateService,
    public dialog: MtxDialog,
    private _contractService: ContractService
  ) {
    super(actr, _vehicleService, RESOURCE.CONTRACT, null, _translateService);
    this.pageSizeRFID = this.pageSizeList[0];
  }
  ngOnInit() {
    this.dataModel.vehicleGroupOpt = AppStorage.get('vehicle-group');
    this.dataModel.vehicleTypeOpt = AppStorage.get('vehicle-type');
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'customer-management.vehiclesNotRFIDTable.licensePlates', field: 'plateNumber' },
      { i18n: 'customer-management.vehiclesNotRFIDTable.vehiclesOwner', field: 'owner' },
      { i18n: 'customer-management.vehiclesNotRFIDTable.vehiclesTypeFee', field: 'nameType' },
      { i18n: 'vehicle.cargoVolume', field: 'cargoWeight', type: 'number' },
      { i18n: 'vehicle.seatAmount', field: 'seatNumber', type: 'number' },
      {
        i18n: 'customer-management.vehiclesHaveRFIDTable.cardStatus',
        field: 'status',
        type: 'custom',
      },
    ];
    this.columnsWithRFID = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'customer-management.vehiclesNotRFIDTable.licensePlates', field: 'plateNumber' },
      { i18n: 'customer-management.vehiclesHaveRFIDTable.serialNumber', field: 'rfidSerial' },
      { i18n: 'vehicle.groupTypeVehicleFee', field: 'nameGroup' },
      { i18n: 'customer-management.vehiclesHaveRFIDTable.feeCollection', field: 'salesType' },
      {
        i18n: 'customer-management.vehiclesHaveRFIDTable.cardStatus',
        field: 'activeStatus',
        type: 'custom',
      },
    ];
  }
  getData() {
    if (!this.startFrom.hasError('matDatepickerMax')) {
      this.isLoading = true;
      this.searchModel.startDate = this.startFrom.value
        ? moment(this.startFrom.value)
            .format(COMMOM_CONFIG.DATE_FORMAT)
            .toString()
        : null;
      this.searchModel.endDate = this.endFrom.value
        ? moment(this.endFrom.value)
            .format(COMMOM_CONFIG.DATE_FORMAT)
            .toString()
        : null;
      if (!this.searchModel.startDate) {
        delete this.searchModel.startDate;
      }
      if (!this.searchModel.endDate) {
        delete this.searchModel.endDate;
      }
      this._vehicleService
        .searchVehiclesNotAssignRFID(this.searchModel, this.contractId)
        .subscribe(rs => {
          if (rs.mess.code === 1) {
            this.dataModel.dataSourceNotRFID = rs.data.listData;
            this.dataModel.dataSourceNotRFID.map(x => {
              x.nameType = this.dataModel.vehicleTypeOpt.find(f => f.id === x.vehicleTypeId)?.name;
              return x;
            });
            this.totalRecord = rs.data.count;
            this.isLoading = false;
          }
        });
    }
  }
  getDataVehicleWithRFID() {
    if (!this.startRFIDFrom.hasError('matDatepickerMax')) {
      this.isLoadingRFID = true;
      this.searchModelRFID.startDate = this.startRFIDFrom.value
        ? moment(this.startRFIDFrom.value)
            .format(COMMOM_CONFIG.DATE_FORMAT)
            .toString()
        : null;
      this.searchModelRFID.endDate = this.endRFIDFrom.value
        ? moment(this.endRFIDFrom.value)
            .format(COMMOM_CONFIG.DATE_FORMAT)
            .toString()
        : null;
      if (!this.searchModelRFID.startDate) {
        delete this.searchModelRFID.startDate;
      }
      if (!this.searchModelRFID.endDate) {
        delete this.searchModelRFID.endDate;
      }
      this.searchModelRFID.startrecord = this.startRecordRFID;
      this.searchModelRFID.pagesize = this.pageSizeRFID;
      this._vehicleService
        .searchVehiclesAssignRFID(this.searchModelRFID, this.contractId)
        .subscribe(rs => {
          if (rs.mess.code === 1) {
            this.dataModel.dataSourceWithRFID = rs.data.listData;
            this.dataModel.dataSourceWithRFID.map(x => {
              x.nameGroup = this.dataModel.vehicleGroupOpt.find(
                f => f.id === x.vehicleGroupId
              )?.name;
              return x;
            });
            this.dataModel.totalRecordRFID = rs.data.count;
            this.isLoadingRFID = false;
          }
        });
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.contractId.currentValue) {
      this.getData();
      this.getDataVehicleWithRFID();
    } else {
      this.dataModel.dataSourceWithRFID = [];
      this.dataModel.dataSourceNotRFID = [];
      this.isLoadingRFID = false;
      this.dataModel.totalRecordRFID = 0;
      this.totalRecord = 0;
    }
  }
  onPageChangeRFID(event) {
    this.indexRFID = event.pageIndex;
    this.startRecordRFID =
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize;
    this.pageSizeRFID = event.pageSize;
    this.getDataVehicleWithRFID();
  }
  onSearchRFID() {
    this.indexRFID = 0;
    this.searchModelRFID.startrecord = 0;
    this.getDataVehicleWithRFID();
  }
  showListTicket(item) {
    this._contractService.searchDetailsContract(null, this.contractId).subscribe(rs => {
      if (rs.mess.code === HTTP_CODE.SUCCESS) {
        this.dialog.originalOpen(BuyTicketHistoryComponent, {
          width: '80%',
          panelClass: 'my-dialog',
          data: { data: { item, dataContract: rs.data.listData[0] }, isView: true },
        });
      }
    });
  }
}
