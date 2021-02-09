import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { VehicleService } from '@app/core';
import { AppStorage } from '@app/core/services/AppStorage';
import { HTTP_CODE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';

class SearchModel {
  saleTransDateFrom?: string;
  saleTransDateTo?: string;
  serviceFeeId?: number;
  pagesize?: any;
  startrecord?: any;
}

@Component({
  selector: 'other-transaction',
  templateUrl: './other-transaction.component.html',
})
export class OtherTransactionComponent extends BaseComponent implements OnInit, OnChanges {
  searchListTransaction = [];
  @Input() dataSelect: any;
  contract_Id: number;
  pagesize?: any;
  startrecord?: any;
  dataServicesFees: any;
  @ViewChild('tableBuyticket') tableBuyticket: MatTable<any>;
  saleTransType: number;

  constructor(
    protected _toastr: ToastrService,
    private _vehicleTransactions: VehicleService,
    protected _translateService: TranslateService,
    public _dialog?: MtxDialog,
    public _actr?: ActivatedRoute,
    private fb?: FormBuilder
  ) {
    super();
    this.formSearch = this.fb.group({
      saleTransDateFrom: [''],
      saleTransDateTo: [''],
      saleTransType: [''],
      pagesize: [this.pageSizeList[0]],
      startrecord: [0],
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.contract_Id = this.dataSelect.contractId;
    this.searchListTransaction = [];
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
        i18n: 'exchangeHistory.loaigd',
        field: 'serviceFeeName',
      },
      {
        i18n: 'exchangeHistory.ntd',
        field: 'createUser',
      },
      {
        i18n: 'exchangeHistory.tggd',
        field: 'saleTransDate',
      },
      {
        i18n: 'exchangeHistory.money',
        field: 'amount',
      },
      {
        i18n: 'exchangeHistory.ndgd',
        field: 'saleTransContent',
      },
    ];
    super.mapColumn();
    this.dataServicesFees = AppStorage.get('servicesFees');
  }

  getData() {
    this.isLoading = true;
    let param: SearchModel = {};
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
    if (Number(this.formSearch.value.saleTransType)) {
      param.serviceFeeId = Number(this.formSearch.value.saleTransType);
    }
    param.pagesize = this.formSearch.controls['pagesize'].value;
    param.startrecord = this.formSearch.controls['startrecord'].value;
    this._vehicleTransactions.searchOtherTransaction(param, this.contract_Id).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.searchListTransaction = res.data.listData;
        this.totalRecord = res.data.count;
        this.isLoading = false;
      }
    });
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.formSearch.controls['startrecord'].setValue(
      event.pageIndex == 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.formSearch.controls['pagesize'].setValue(event.pageSize);
    this.getData();
  }
  onSearch() {
    this.pageIndex = 0;
    this.formSearch.controls['startrecord'].setValue(0);
    this.formSearch.controls['pagesize'].setValue(this.pageSizeList[0]);
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
