import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { AppStorage } from '@app/core/services/AppStorage';
import { CommonSettleService, SharedDirectoryService } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { BUY_TICKET, HTTP_CODE } from '@app/shared/constant/common.constant';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

class SearchModel {
  code?: any;
  stationType?: number;
  stationInId?: number;
  stationOutId?: number;
  sourceTransaction?: string;
  timestampOutFrom?: string;
  timestampOutTo?: string;
  timestampInFrom?: string;
  timestampInTo?: string;
  pagesize?: any;
  startrecord?: any;
}

@Component({
  selector: 'car-stration',
  templateUrl: './car-stration.component.html',
})
export class CarStrationComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy {
  dataTransactionType: any;
  dataOptionStationType: any;
  dataOptionStages: any;
  dataOptionStations: any;
  dataSearch: any;
  showStations = false;
  showStages = true;
  stationIn_Id: number;
  stationOut_Id: number;
  transactionType: {};
  plateNumber: any;
  maxDate: Date;
  minToDate: Date;
  @Input() dataSelect: any;
  @ViewChild('tableBuyticket') tableCarStration: MatTable<any>;
  departDate: Date;
  returnDate: Date;
  stageStationName: string;
  sub: Subscription
  constructor(
    private _searchInfoVehicle: SharedDirectoryService,
    private _commonSettleService: CommonSettleService,
    protected _toastr: ToastrService,
    protected _translateService: TranslateService,
    public _dialog?: MtxDialog,
    public _actr?: ActivatedRoute,
    private fb?: FormBuilder
  ) {
    super();

    this.formSearch = this.fb.group({
      stationType: [''],
      stages: [''],
      stations: [''],
      sourceTransaction: [''],
      timestampOutFrom: ['', Validators.required],
      timestampOutTo: ['', Validators.required],
      pagesize: [this.pageSizeList[0]],
      startrecord: [0],
    });
  }
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.plateNumber = this.dataSelect.plateNumber;
    this.dataTransactionType = [];
    this.formSearch.reset();
    this.getStationType();
  }

  ngOnInit() {
    this.columns = [
      {
        i18n: 'exchangeHistory.stt',
        field: 'orderNumber',
        type: 'order',
      },
      {
        i18n: 'exchangeHistory.mgd',
        field: 'ticketId',
      },
      {
        i18n: 'search-information.station-input',
        field: 'stationInName'
      },
      {
        i18n: 'search-information.time-station-input',
        field: 'timestampIn'
      },
      {
        i18n: 'search-information.station-output',
        field: 'stationOutName'
      },
      {
        i18n: 'search-information.time-station-output',
        field: 'timestampOut'
      },
      {
        i18n: 'exchangeHistory.type_car',
        field: 'vehicleTypeName'
      },
      {
        i18n: 'exchangeHistory.type_ticket',
        field: 'ticketTypeName'
      },
      {
        i18n: 'EPC',
        field: 'epc'
      },
      { i18n: 'search-information.source-transection', field: 'sourceTransaction' },
      {
        i18n: 'exchangeHistory.money',
        field: 'price',
        type: 'currency'
      },
    ];
    this.dataTransactionType = AppStorage.get('transaction-source').listData;
    this.getStationType();
    this.sub = this.formSearch.controls.stationType.valueChanges.subscribe(rs => {
      this.getValueStationType(rs);
    })
  }
  getStationType() {
    this.dataOptionStationType = AppStorage.get('station-type');
  }

  getStages() {
    this._searchInfoVehicle.getStagesCRM().subscribe(res => {
      this.dataOptionStages = res.data.listData;
    });
  }

  getStations() {
    this._searchInfoVehicle.getStationsOpens().subscribe(res => {
      this.dataOptionStations = res.data.listData;
    });
  }

  getCarStration() {
    this.isLoading = true;
    const param: SearchModel = {};
    if (this.formSearch.value.stationType == BUY_TICKET.TRAM_KIN) {
      param.stationInId = Number(this.stationIn_Id);
      param.stationOutId = Number(this.stationOut_Id);
      if (this.formSearch.value.timestampOutFrom) {
        param.timestampOutFrom = moment(this.formSearch.value.timestampOutFrom).format(
          COMMOM_CONFIG.DATE_FORMAT
        );
      }
      if (this.formSearch.value.timestampOutTo) {
        param.timestampOutTo = moment(this.formSearch.value.timestampOutTo).format(
          COMMOM_CONFIG.DATE_FORMAT
        );
      }
    } else {
      if (this.formSearch.value.stations) {
        param.stationInId = Number(this.formSearch.value.stations);
        this.stageStationName = this.dataOptionStations.find(x => x.code == this.formSearch.value.stations).name;
      }
      if (this.formSearch.value.timestampOutFrom) {
        param.timestampInFrom = moment(this.formSearch.value.timestampOutFrom).format(
          COMMOM_CONFIG.DATE_FORMAT
        );
      }
      if (this.formSearch.value.timestampOutTo) {
        param.timestampInTo = moment(this.formSearch.value.timestampOutTo).format(
          COMMOM_CONFIG.DATE_FORMAT
        );
      }
    }
    param.sourceTransaction = this.formSearch.controls.sourceTransaction.value;
    param.code = this.plateNumber ? this.plateNumber : '';
    for (const prop in param) {
      if (!param[prop]) {
        delete param[prop];
      }
    }
    param.stationType = this.formSearch.value.stationType;
    param.pagesize = this.formSearch.controls.pagesize.value;
    param.startrecord = this.formSearch.controls.startrecord.value;
    this._commonSettleService.searchVehicleTransactions(param).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.dataModel.dataSource = res.data.listData
        this.totalRecord = res.data.count;
        this.isLoading = false;
      }
    });
  }
  onSearch() {
    this.pageIndex = 0;
    this.formSearch.controls.startrecord.setValue(0);
    this.formSearch.controls.pagesize.setValue(this.pageSizeList[0]);
    this.getCarStration();
  }
  getStationInOut(value) {
    value = value.id;
    if (value) {
      this.getStagesDetail(value);
    }
  }

  getStagesDetail(stagesId) {
    this._searchInfoVehicle.getStagesDetail(stagesId).subscribe(res => {
      this.stageStationName = res.data.name;
      this.stationIn_Id = res.data.station_input_id;
      this.stationOut_Id = res.data.station_output_id;
    });
  }

  getValueStationType(value) {
    if (value == BUY_TICKET.TRAM_KIN) {
      this.showStages = true;
      this.showStations = false;
      this.getStages();
    }
    if (value == BUY_TICKET.TRAM_MO) {
      this.showStages = false;
      this.showStations = true;
      this.getStations();
    }
    if (value == null) {
      this.dataOptionStages = [];
      this.dataOptionStations = [];
    }
    this.formSearch.controls.stages.setValue(null);
    this.formSearch.controls.stations.setValue(null);
  }

  addDate(date: Date): Date {
    date.setDate(date.getDate() + 30);
    return date;
  }

  subDate(date: Date): Date {
    date.setDate(date.getDate() - 30);
    return date;
  }

  getValueTimeOutFrom(value) {
    if (value) {
      const x = new Date(value);
      this.maxDate = this.addDate(x);
    } else {
      this.maxDate = null;
    }
  }

  getValueTimeOutTo(value) {
    if (value) {
      const x = new Date(value);
      this.minToDate = this.subDate(x);
    } else {
      this.minToDate = null;
    }
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.formSearch.controls.startrecord.setValue(
      event.pageIndex == 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.formSearch.controls.pagesize.setValue(event.pageSize);
    this.getCarStration();
  }
}
