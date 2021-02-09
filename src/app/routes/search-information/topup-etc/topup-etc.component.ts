import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TopupEtcService } from '@app/core/services/search-information/topup-etc/topup-etc.service';
import { HTTP_CODE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-topup-etc',
  templateUrl: './topup-etc.component.html',
  styleUrls: ['./topup-etc.component.scss']
})
export class TopupEtcComponent extends BaseComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _topupEtcService: TopupEtcService
  ) {
    super();
    this.formSearch = this.fb.group({
      startTime: [],
      endTime: [],
      startDate: [''],
      endDate: [''],
      staffName: [''],
      contractId: [''],
      saleOrderId: [''],
      startrecord: [0],
      pagesize: [this.pageSizeList[0]]
    });
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'search-information.id', field: 'id' },
      { i18n: 'search-information.topupDate', field: 'topupDate', type: 'datetimefull' },
      { i18n: 'search-information.staffName', field: 'staffName' },
      { i18n: 'search-information.contractId', field: 'contractId' },
      { i18n: 'search-information.orderId', field: 'saleOrderId' }
    ];
    this.searchTopupEtc();
  }

  searchTopupEtc() {
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
      for (const item in searchObj) {
        if (!searchObj[item] || typeof searchObj[item] === 'undefined') {
          delete searchObj[item]
        }
      }
      if (this.formSearch.value.startrecord == 0) {
        searchObj.startrecord = 0;
      }
      this.handleTrimSpaceObjectSearch(searchObj);
      this._topupEtcService.searchTopupEtc(searchObj).subscribe(rs => {
        if (rs.mess.code == HTTP_CODE.SUCCESS) {
          this.dataModel.dataSource = rs.data.listData;
          this.totalRecord = rs.data.count;
          this.isLoading = false;
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
    this.searchTopupEtc();
  }

  onSearch() {
    this.pageIndex = 0;
    this.formSearch.controls.startrecord.setValue(0);
    this.searchTopupEtc();
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
      this.handleTrimSpaceObjectSearch(searchModelExcel);
      this._topupEtcService.exportExcelTopupEtc(searchModelExcel).subscribe(
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

  handleTrimSpaceObjectSearch(searchObj: any) {
    delete searchObj.startTime;
    delete searchObj.endTime;
    searchObj.staffName = searchObj.staffName ? searchObj.staffName.trim() : '';
    searchObj.contractId = searchObj.contractId ? searchObj.contractId.trim() : '';
    searchObj.saleOrderId = searchObj.saleOrderId ? searchObj.saleOrderId.trim() : '';
  }
}