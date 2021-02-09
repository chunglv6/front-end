import { Component, OnInit, ChangeDetectorRef, AfterContentChecked, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';
import { CustomerService } from '@app/core/services/customer/customer.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { HTTP_CODE, STATUS_RFID_VEHICLE } from '@app/shared/constant/common.constant';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';
import { COMMOM_CONFIG } from '@env/environment';

@Component({
  selector: 'app-search-info-search',
  templateUrl: './search-info-search.component.html',
  styleUrls: ['./search-info-search.component.css'],
})
export class SearchInfoSearchComponent extends BaseComponent
  implements OnInit, AfterContentChecked {
  statusCardList = [];
  dataSourceTree = [];
  startDateForm = new FormControl();
  endDateForm = new FormControl();
  isClickSearch = false;
  constructor(
    public _actr: ActivatedRoute,
    public _dialog: MtxDialog,
    private _customerService: CustomerService,
    protected _toastr: ToastrService,
    protected _translateService: TranslateService,
    private cdref: ChangeDetectorRef
  ) {
    super(_actr, _customerService, RESOURCE.CUSTOMER, _toastr, _translateService, _dialog);
  }
  ngAfterContentChecked(): void {
    this.cdref.detectChanges();
  }
  ngOnInit() {
    this.statusCardList = [
      { value: null, label: this._translateService.instant('common.default-select') },
      {
        value: STATUS_RFID_VEHICLE.CHUAKICHHOAT,
        label: this._translateService.instant('common.deadActive'),
      },
      {
        value: STATUS_RFID_VEHICLE.HOATDONG,
        label: this._translateService.instant('common.active'),
      },
      { value: STATUS_RFID_VEHICLE.HUY, label: this._translateService.instant('common.cancel') },
      {
        value: STATUS_RFID_VEHICLE.DONG,
        label: this._translateService.instant('common.button.close'),
      },
      { value: STATUS_RFID_VEHICLE.MO, label: this._translateService.instant('common.open') },
      {
        value: STATUS_RFID_VEHICLE.DACHUYENNHUONG,
        label: this._translateService.instant('common.transfered'),
      },
    ];
    this.getData();
  }
  getData() {
    if (this.startDateForm.valid && this.endDateForm) {
      this.searchModel.startDate = this.startDateForm.value
        ? moment(this.startDateForm.value)
          .format(COMMOM_CONFIG.DATE_FORMAT)
          .toString()
        : null;
      this.searchModel.endDate = this.endDateForm.value
        ? moment(this.endDateForm.value)
          .format(COMMOM_CONFIG.DATE_FORMAT)
          .toString()
        : null;
      if (!this.searchModel.startDate) {
        delete this.searchModel.startDate;
      }
      if (!this.searchModel.endDate) {
        delete this.searchModel.endDate;
      }
      delete this.searchModel.pagesize;
      this.searchModel.pagesize = 20;
      this._customerService.searchAllCustomers(this.searchModel).subscribe(rs => {
        if (rs.mess.code === HTTP_CODE.SUCCESS) {
          this.dataSourceTree = rs.data.listData;
        }
      });
    }
  }
  onSearch() {
    this.getData();
    this.isClickSearch = true;
  }
}
