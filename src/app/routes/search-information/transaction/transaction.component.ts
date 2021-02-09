import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HistoryActionService } from '@app/core';
import { HTTP_CODE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent extends BaseComponent implements OnInit {
  listSource = ['VTP', 'MoMo'];
  listStatus = [];
  constructor(
    private fb: FormBuilder,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _historyActionService: HistoryActionService
  ) {
    super();
    this.formSearch = this.fb.group({
      contractNo: [],
      saleOrderSource: [], //viettelpay hoac momo
      startDate: [],
      endDate: [],
      saleOrderBefore: [], //từ ngày
      saleOrderAfter: [], //đến ngày
      payGateStatus: [],
      ocsStatus: [],
      startrecord: [0],
      pagesize: [this.pageSizeList[0]]
    });
  }
  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'Order ID', field: 'saleOrderId', type: 'number' },
      { i18n: 'search-information.transaction_date', field: 'saleOrderDate', type: 'datetime' },
      { i18n: 'exchangeHistory.money', field: 'amount', type: 'currency' },
      { i18n: 'buyTicket.method_Recharge', field: 'saleOrderSource', width: '12%', type: 'custom' },
      { i18n: 'contract.code', field: 'contractNo' },
      { i18n: 'search-information.transaction_vtp_status', field: 'payGateStatus', type: 'custom' },
      { i18n: 'search-information.transaction_momo_status', field: 'ocsStatus', type: 'custom' },
    ];
    this.listStatus = [
      { value: 1, label: this._translateService.instant('search-information.success') },
      { value: 0, label: this._translateService.instant('search-information.fail') }
    ]
    this.getData();
  }
  getData() {
    if (this.formSearch.valid) {
      this.isLoading = true;
      this.formSearch.controls.saleOrderBefore.setValue(
        this.formSearch.controls.startDate.value
          ? moment(this.formSearch.controls.startDate.value)
            .format(COMMOM_CONFIG.DATE_FORMAT)
            .toString()
          : null
      );
      this.formSearch.controls.saleOrderAfter.setValue(
        this.formSearch.controls.endDate.value
          ? moment(this.formSearch.controls.endDate.value)
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
      if (this.formSearch.value.payGateStatus == 0) {
        searchObj.payGateStatus = 0;
      }
      if (this.formSearch.value.ocsStatus == 0) {
        searchObj.payGateStatus = 0;
      }
      this._historyActionService.saleOrders(searchObj).subscribe(rs => {
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
    this.getData();
  }
  onSearch() {
    this.pageIndex = 0;
    this.formSearch.controls.startrecord.setValue(0);
    this.getData();
  }

}
