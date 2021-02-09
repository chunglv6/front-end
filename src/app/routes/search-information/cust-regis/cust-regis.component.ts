import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CustomerService } from '@app/core';
import { HTTP_CODE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cust-regis',
  templateUrl: './cust-regis.component.html',
  styleUrls: ['./cust-regis.component.css']
})

export class CustRegisComponent extends BaseComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _customerService: CustomerService
  ) {
    super();
    this.formSearch = this.fb.group({
      startTime: [],
      endTime: [],
      startDate: [''],
      endDate: [''],
      startrecord: [0],
      pagesize: [this.pageSizeList[0]]
    });
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'stt', type: 'order' },
      { i18n: 'search-information.fullName', field: 'custName' },
      { i18n: 'search-information.numberPhone', field: 'phoneNumber' },
      { i18n: 'search-information.city', field: 'provinceName' },
      { i18n: 'search-information.district', field: 'districName' },
      { i18n: 'search-information.ward', field: 'communeName' },
      { i18n: 'search-information.plate_number', field: 'plateNumber' },
      { i18n: 'search-information.regDate', field: 'regDate', type: 'datetimefull' },
      { i18n: 'search-information.orderNumber', field: 'orderNumber' }
    ];
    this.searchCustRegis();
  }

  searchCustRegis() {
    if (this.formSearch.valid) {
      this.isLoading = true;
      this.formSearch.controls.startDate.setValue(
        this.formSearch.controls.startTime.value
          ? moment(this.formSearch.controls.startTime.value)
            .format(COMMOM_CONFIG.DATE_FORMAT)
            .toString()
          : null
      );
      this.formSearch.controls.endDate.setValue(
        this.formSearch.controls.endTime.value
          ? moment(this.formSearch.controls.endTime.value)
            .format(COMMOM_CONFIG.DATE_FORMAT)
            .toString()
          : null
      );
      let searchObj = Object.assign({}, this.formSearch.value);
      delete searchObj.startTime;
      delete searchObj.endTime;
      for (const item in searchObj) {
        if (!searchObj[item] || typeof searchObj[item] === 'undefined') {
          delete searchObj[item]
        }
      }
      if (this.formSearch.value.startrecord == 0) {
        searchObj.startrecord = 0;
      }
      this._customerService.searchCustRegis(searchObj).subscribe(rs => {
        if (rs.mess.code == HTTP_CODE.SUCCESS) {
          this.dataModel.dataSource = rs.data.listData;
          this.totalRecord = rs.data.count;
          this.isLoading = false;
          console.log(this.dataModel.dataSource);
        } else {
          this._toastrService.error(rs.mess.description);
        }
      }, error => {
        this._toastrService.error(this._translateService.instant('common.500Error'));
      })
    }
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.formSearch.controls.startrecord.setValue(
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.formSearch.controls.pagesize.setValue(event.pageSize);
    this.searchCustRegis();
  }

  onSearch() {
    this.pageIndex = 0;
    this.formSearch.controls.startrecord.setValue(0);
    this.searchCustRegis();
  }

  exportFile() {
    if (this.formSearch.valid) {
      this.formSearch.controls.startDate.setValue(
        this.formSearch.controls.startTime.value
          ? moment(this.formSearch.controls.startTime.value)
            .format(COMMOM_CONFIG.DATE_FORMAT)
            .toString()
          : null
      );
      this.formSearch.controls.endDate.setValue(
        this.formSearch.controls.endTime.value
          ? moment(this.formSearch.controls.endTime.value)
            .format(COMMOM_CONFIG.DATE_FORMAT)
            .toString()
          : null
      );
      const searchModelExcel = Object.assign({}, this.formSearch.value);
      delete searchModelExcel.startrecord;
      delete searchModelExcel.pagesize;
      delete searchModelExcel.startTime;
      delete searchModelExcel.endTime;
      this._customerService.exportExcelCustRegis(searchModelExcel).subscribe(
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
  }
}
