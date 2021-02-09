import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';
import { CommonCRMService, CommonSettleService } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { STATION_TYPE } from '@app/shared/constant/common.constant';
import { SharedDirectoryService } from '@app/shared/services/shared-directory.service';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-vehicle-history-via-station',
  templateUrl: './vehicle-history-via-station.component.html',
  styleUrls: ['./vehicle-history-via-station.component.css']
})
export class VehicleHistoryViaStationComponent extends BaseComponent implements OnInit {
  formSearch: FormGroup;
  listStationType = [];
  listBots = [];

  listTransactionSource = [];
  listTicketPriceTypes = [];
  listVehicleFee = [];

  listStationClose = [];
  listSationOpen = [];
  listLanClose = [];
  listLaneOpen = [];

  isEnteredDate = true;

  maxDate: Date;
  minDate: Date;
  maxDateOut: Date;
  minDateOut: Date;
  noDisableStationOut = false;
  noBiggerMin = true;
  noBetween30 = true;
  searchModelExcel: any = {};
  stationType = STATION_TYPE;
  constructor(
    public actr: ActivatedRoute,
    private fb: FormBuilder,
    protected translateService: TranslateService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
    public _sharedDirectoryService?: SharedDirectoryService,
    public _commonCRMService?: CommonCRMService,
    public _commonSettleService?: CommonSettleService
  ) {
    super(actr, null, RESOURCE.SEARCH, toastr, translateService, dialog);
    this.formSearch = this.fb.group({
      dateInStart: ['', Validators.required],
      dateInEnd: ['', Validators.required],
      timestampInFrom: [],
      timestampInTo: [],
      timestampOutFrom: [],
      timestampOutTo: [],
      // sẽ add required sau khi đổi loại trạm
      dateInStartOut: [''],
      dateInEndOut: [''],
      //
      code: [''],
      stationInId: [''],
      laneInId: [''],
      stationType: [''],
      sourceTransaction: [''],
      stationOutId: [''],
      laneOutId: [''],
      ticketType: [],
      vehicleType: [],
      startrecord: [0],
      pagesize: [10]
    });
  }

  ngOnInit() {
    this.isLoading = false;
    this.getStationTypes();
    this.getStationsOpenes();
    this.getListVehicleFee();
    this.getListTicketPriceTypes();
    this.getTransactionSource();

    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'search-information.code-transection', field: 'ticketId' },
      { i18n: 'search-information.station-input', field: 'stationInName' },
      { i18n: 'search-information.time-station-input', field: 'timestampIn' },
      { i18n: 'search-information.station-output', field: 'stationOutName' },
      { i18n: 'search-information.time-station-output', field: 'timestampOut' },
      { i18n: 'search-information.time-transection', field: 'eventTimestamp' },// Thời gian thực hiện giao dịch
      { i18n: 'briefcase.license_plates', field: 'plateNumber' },
      { i18n: 'pricelist-add.vehiclesCountFee', field: 'vehicleTypeName' },// Loại phương tiện tính phí
      { i18n: 'search-information.exception-form', field: 'exceptionName' },// hình thức ngoại lệ
      { i18n: 'search-information.source-transection', field: 'sourceTransaction' },
      { i18n: 'buyTicket.ticket', field: 'ticketTypeName' },
      { i18n: 'EPC', field: 'EPC' },
      { i18n: 'search-information.monney', field: 'price' },
    ];
    super.mapColumn();
  }
  getStationTypes() {
    this._sharedDirectoryService.getStationType().subscribe(res => {
      if (res.mess.code == 1) {
        this.listStationType = res.data.map(val => {
          return {
            code: Number(val.code),
            val: val.val
          };
        });
        this.formSearch.controls.stationType.setValue(this.listStationType[1].code);
      }
    });
  }

  // xử lý combobox Loại trạm
  selectionChangeStationType() {
    this.formSearch.controls.stationInId.setValue(null);// trungdq16: clear selection drop down trạm vào, trạm ra khi đổi loại trạm.
    this.formSearch.controls.stationOutId.setValue(null);
    this.formSearch.controls.laneInId.setValue(null);
    this.formSearch.controls.laneOutId.setValue(null);
    if (this.formSearch.controls.stationType.value == STATION_TYPE.TRAM_MO) {
      this.formSearch.controls.dateInStartOut.clearValidators();
      this.formSearch.controls.dateInStartOut.updateValueAndValidity();
      this.formSearch.controls.dateInEndOut.clearValidators();
      this.formSearch.controls.dateInEndOut.updateValueAndValidity();
      this.formSearch.controls.dateInStartOut.setValue(null);
      this.formSearch.controls.dateInEndOut.setValue(null);
      this.getStationsOpenes();
    } else if (this.formSearch.controls.stationType.value == STATION_TYPE.TRAM_KIN) {
      this.formSearch.controls.dateInStartOut.setValidators([Validators.required]);
      this.formSearch.controls.dateInEndOut.setValidators([Validators.required]);
      this.formSearch.controls.dateInStartOut.updateValueAndValidity();
      this.formSearch.controls.dateInEndOut.updateValueAndValidity();
      this.getStationsCloses();
    }
  }

  // Trạm theo Loại thu phí kín
  getStationsCloses() {
    this._sharedDirectoryService.getStationsCloses().subscribe(res => {
      if (res.mess.code == 1) {
        this.listStationClose = res.data.listData;
        this.listSationOpen = res.data.listData;
      }
    });
  }

  // Trạm theo Loại thu phí mở
  getStationsOpenes() {
    this._sharedDirectoryService.getStationsOpens().subscribe(res => {
      if (res.mess.code == 1) {
        this.listSationOpen = res.data.listData;
      }
    });
  }

  // Lấy làn vào theo id trạm
  getLanesIn(value) {
    this.formSearch.controls.laneInId.setValue(null);
    if (value) {
      this._sharedDirectoryService.getLanes(value.id).subscribe(res => {
        if (res.mess.code == 1) {
          this.listLaneOpen = res.data.laneList;
        }
      });
    } else {
      this.listLaneOpen = [];
    }
  }

  // Lấy làn ra theo id trạm
  getLanesOut(value) {
    this.formSearch.controls.laneOutId.setValue(null);
    if (value) {
      this._sharedDirectoryService.getLanes(value.id).subscribe(res => {
        if (res.mess.code == 1) {
          this.listLanClose = res.data.laneList;
        }
      });
    } else {
      this.listLanClose = [];
    }
  }

  // Nguồn giao dịch
  getTransactionSource() {
    this._sharedDirectoryService.getCategories('TRANSACTION_SOURCE').subscribe(res => {
      if (res.mess.code == 1) {
        this.listTransactionSource = res.data.listData.map(val => {
          return {
            code: val.name,
            value: val.name
          };
        });
      }
    });
  }
  // loai ve
  getListTicketPriceTypes() {
    this._commonCRMService.getTicketPriceTypes().subscribe(res => {
      if (res.mess.code == 1) {
        this.listTicketPriceTypes = res.data.listData.map(val => {
          return {
            code: val.servicePlanTypeId,
            value: val.name
          };
        });
      }
    });
  }
  // loai xe thu phi
  getListVehicleFee() {
    this._sharedDirectoryService.getListVehicleFee().subscribe(res => {
      if (res.mess.code == 1) {
        this.listVehicleFee = res.data.listData.map(val => {
          return {
            id: val.id,
            value: val.name
          };
        });
      }
    });
  }

  isNull(value): boolean {
    if (value == null || value == undefined || value == '')
      return true;
    return false;
  }

  getData() {
    this.isLoading = true;
    this.handleSearchModelTrim();
    this.searchModel = { ...this.formSearch.value };
    for (const item in this.searchModel) {
      if (!this.searchModel[item]) {
        delete this.searchModel[item]
      }
    }
    this.searchModel.stationType = this.formSearch.controls.stationType.value;
    this.searchModel.startrecord = this.formSearch.controls.startrecord.value;
    this._commonSettleService.searchVehicleTransactions(this.searchModel).subscribe(res => {
      if (res.mess.code == 1) {
        this.dataModel.dataSource = res.data.listData.map(x => {
          x.plateNumber = x.plateNumber || x.plateRecognition
          return x;
        });
        this.totalRecord = res.data.count;
        this.isLoading = false;
      } else {
        this.toastr.error(this.translateService.instant(res.mess.description));
      }
    });
  }

  handleButtonSearch(formInvalid, isStationOut, noBig, noBet): boolean {
    if (formInvalid == false && isStationOut == false)
      return false;
    if (formInvalid == false && isStationOut == true && noBig == false && noBet == false)
      return false;
    return true;
  }

  compareDateMin(x: Date, y: Date): boolean {
    if (!x || !y) {
      this.noBiggerMin = true;
      return false;
    }
    if (x.getTime() < y.getTime()) {
      this.noBiggerMin = true;
      return true;
    }
    this.noBiggerMin = false;
    return false;
  }

  compareDate30(x: Date, y: Date): boolean {
    if (!x || !y) {
      this.noBetween30 = true;
      return false;
    }
    if (x.getTime() < y.getTime()) {
      this.noBetween30 = true;
      return true;
    }
    this.noBetween30 = false;
    return false;
  }

  addDate(date: Date): Date {
    date.setDate(date.getDate() + 30);
    return date;
  }

  getValueTimeOutFrom(value) {
    if (!value) {
      this.maxDate = null;
      return;
    }
    const x = new Date(value);
    this.maxDate = this.addDate(x);
  }

  getValueTimeOut(value) {
    if (!value) {
      this.maxDateOut = null;
      return;
    }
    const x = new Date(value);
    this.maxDateOut = this.addDate(x);
  }

  getValueTimeIn(value) {
    if (!value) {
      this.minDateOut = null;
      return;
    }
    const x = new Date(value);
    this.minDateOut = this.subDate(x);
  }

  subDate(date: Date): Date {
    date.setDate(date.getDate() - 30);
    return date;
  }
  getValueTimeInFrom(value) {
    if (!value) {
      this.minDate = null;
      return;
    }
    const x = new Date(value);
    this.minDate = this.subDate(x);
  }

  exportFile() {
    this.handleSearchModelTrim();
    this.searchModelExcel = Object.assign({}, this.formSearch.value);
    delete this.searchModelExcel.startrecord;
    delete this.searchModelExcel.pagesize;
    for (const property in this.searchModelExcel) {
      if (!this.searchModelExcel[property]) {
        delete this.searchModelExcel[property]
      }
    }
    this.searchModelExcel.stationType = this.formSearch.controls.stationType.value;
    let currentLang = this.translateService.currentLang;
    this._commonSettleService.exportFileVehicleTransactions(this.searchModelExcel, currentLang.split('-')[0] ?? 'vi').subscribe(
      res => {
        const contentDisposition = res.headers.get('content-disposition');
        const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
        saveAs(res.body, filename);
      },
      err => {
        this.toastr.warning(this.translateService.instant('common.notify.fail'));
      }
    );
  }
  onSearch() {
    this.pageIndex = 0;
    this.formSearch.controls.startrecord.setValue(0);
    this.getData();
  }
  onPageChangeHistoriesViaStation(event) {
    this.pageIndex = event.pageIndex;
    this.formSearch.controls.startrecord.setValue(event.pageIndex == 0 ? event.pageIndex : ((event.pageIndex * event.pageSize)));
    this.formSearch.controls.pagesize.setValue(event.pageSize);
    this.getData();
  }
  handleSearchModelTrim() {
    this.formSearch.controls.code.value?.trim();
    this.formSearch.controls.timestampInFrom.setValue(this.formSearch.controls.dateInStart.value ? moment(this.formSearch.controls.dateInStart.value).format(COMMOM_CONFIG.DATE_FORMAT) : null);
    this.formSearch.controls.timestampInTo.setValue(this.formSearch.controls.dateInEnd.value ? moment(this.formSearch.controls.dateInEnd.value).format(COMMOM_CONFIG.DATE_FORMAT) : null);

    this.formSearch.controls.timestampOutFrom.setValue(this.formSearch.controls.dateInStartOut.value ? moment(this.formSearch.controls.dateInStartOut.value).format(COMMOM_CONFIG.DATE_FORMAT) : null);
    this.formSearch.controls.timestampOutTo.setValue(this.formSearch.controls.dateInEndOut.value ? moment(this.formSearch.controls.dateInEndOut.value).format(COMMOM_CONFIG.DATE_FORMAT) : null);
  }
}


