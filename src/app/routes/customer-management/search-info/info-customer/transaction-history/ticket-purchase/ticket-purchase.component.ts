import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { VehicleService } from '@app/core';
import { HTTP_CODE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';

class SearchModel {
  efficiencyId?: number;
  saleTransDateFrom?: string;
  saleTransDateTo?: string;
  pagesize?: any;
  startrecord?: any;
}

@Component({
  selector: 'ticket-purchase',
  templateUrl: './ticket-purchase.component.html',
})
export class TicketPurchaseComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() dataSelect: any;
  vehiclesTransaction = [];
  vehicleId: number;
  checkBoxValidity: boolean;
  checkBoxEndValidity: boolean;
  constructor(
    protected _toastr: ToastrService,
    protected _translateService: TranslateService,
    private _vehiclesTransaction: VehicleService,
    public _dialog?: MtxDialog,
    public _actr?: ActivatedRoute,
    private fb?: FormBuilder
  ) {
    super();
    this.formSearch = this.fb.group({
      saleTransDateFrom: [''],
      saleTransDateTo: [''],
      pagesize: [this.pageSizeList[0]],
      startrecord: [0],
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.vehicleId = this.dataSelect.vehicleId;
    this.vehiclesTransaction = [];
    this.formSearch.reset();
    this.onSearch();
  }

  ngOnInit() {
    this.columns = [
      {
        i18n: 'exchangeHistory.mgd',
        field: 'saleTransCode',
      },
      {
        i18n: 'exchangeHistory.tram_doan',
        field: 'stage',
      },
      {
        i18n: 'exchangeHistory.type_ticket',
        field: 'servicePlanTypeName',
      },
      {
        i18n: 'exchangeHistory.money',
        field: 'price',
      },
      {
        i18n: 'exchangeHistory.startBuy',
        field: 'saleTransDate',
      },
      {
        i18n: 'exchangeHistory.personBuy',
        field: 'accountOwner',
      },
      {
        i18n: 'exchangeHistory.ticket-purchase-start',
        field: 'effDate',
      },
      {
        i18n: 'exchangeHistory.endTime',
        field: 'expDate',
      },
      {
        i18n: 'exchangeHistory.ghtd',
        field: 'autoRenew',
      },
      {
        i18n: 'exchangeHistory.hieuluc',
        field: 'status',
      },
    ];
    super.mapColumn();
  }
  getData() {
    this.isLoading = true;
    let param: SearchModel = {};
    if (this.checkBoxValidity && !this.checkBoxEndValidity) {
      param.efficiencyId = 1;
    } else if (!this.checkBoxValidity && this.checkBoxEndValidity) {
      param.efficiencyId = 2;
    } else {
      param.efficiencyId = 0;
    }
    if (this.formSearch.value.saleTransDateFrom) {
      param.saleTransDateFrom = moment(this.formSearch.value.saleTransDateFrom).format(
        COMMOM_CONFIG.DATE_FORMAT
      );
    }
    if (this.formSearch.value.saleTransDateTo) {
      param.saleTransDateTo = moment(this.formSearch.value.saleTransDateTo).format(
        COMMOM_CONFIG.DATE_FORMAT
      );
    }
    param.pagesize = this.formSearch.controls['pagesize'].value;
    param.startrecord = this.formSearch.controls['startrecord'].value;
    this._vehiclesTransaction
      .searchHistoryTransactionVehicle(param, this.vehicleId)
      .subscribe(res => {
        if (res.mess.code == HTTP_CODE.SUCCESS) {
          this.vehiclesTransaction = res.data.listData;
          this.totalRecord = res.data.count;
          this.isLoading = false;
        }
      });
  }

  onSearch() {
    this.pageIndex = 0;
    this.formSearch.controls['startrecord'].setValue(0);
    this.formSearch.controls['pagesize'].setValue(this.pageSizeList[0]);
    this.getData();
  }

  checkCheckBoxValidity(event) {
    this.checkBoxValidity = event.checked;
  }

  checkCheckBoxEndValidity(event) {
    this.checkBoxEndValidity = event.checked;
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.formSearch.controls['startrecord'].setValue(
      event.pageIndex == 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.formSearch.controls['pagesize'].setValue(event.pageSize);
    this.getData();
  }

  birthday: Date;
  maxBirthday = new Date();

  paymentDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
  minPaymentDate = new Date();

  departDate: Date;
  returnDate: Date;
  minTripDate = new Date();
  maxTripDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  startTripDate = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);
  appointmentDate: Date;
  minAppointmentDate = new Date();
  maxAppointmentDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  weekdaysOnly = (d: Date) => d.getDay() !== 0 && d.getDay() !== 6;
}
