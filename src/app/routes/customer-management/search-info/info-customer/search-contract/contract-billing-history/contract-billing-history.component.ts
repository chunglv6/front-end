import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';
import { HTTP_CODE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { TranslateService } from '@ngx-translate/core';
import { CommonBillingService } from '@shared/services/common-billing.service';
import { saveAs } from 'file-saver';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-contract-billing-history',
  templateUrl: './contract-billing-history.component.html',
  styleUrls: ['./contract-billing-history.component.css'],
})
export class ContractBillingHistoryComponent extends BaseComponent implements OnInit, OnChanges {
  startForm = new FormControl();
  toForm = new FormControl();
  @Input() node: any;
  constructor(
    protected _activatedRoute: ActivatedRoute,
    protected _translateService: TranslateService,
    protected _toastrService: ToastrService,
    private _commonBillingService: CommonBillingService
  ) {
    super(
      _activatedRoute,
      _commonBillingService,
      RESOURCE.CONTRACT,
      _toastrService,
      _translateService
    );
  }
  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'contract.billing.signContract', field: 'invoiceSeries' },
      { i18n: 'contract.billing.codeContract', field: 'invoiceNo' },
      { i18n: 'contract.billing.dateContract', field: 'invoiceIssuedDate', type: 'datetime' },
      { i18n: 'contract.billing.priceContract', field: 'totAmount', type: 'currency' },
      { i18n: 'exchangeHistory.tram_doan', field: 'station' },
      {
        i18n: 'customer-management.vehiclesHaveRFIDTable.actionView',
        field: 'view',
        type: 'custom',
      },
    ];
  }
  getData() {
    if (!this.startForm.hasError('matDatepickerMax')) {
      this.isLoading = true;
      if (this.startForm.value) {
        this.searchModel.from = moment(this.startForm.value).format('MM/DD/YYYY');
      } else {
        delete this.searchModel.from;
      }
      if (this.toForm.value) {
        this.searchModel.to = moment(this.toForm.value).format('MM/DD/YYYY');
      } else {
        delete this.searchModel.to;
      }
      this.searchModel.pageSize = this.searchModel.pagesize;
      this.searchModel.start = this.searchModel.startrecord;
      this.searchModel.contractId = this.node.contractId;
      if (!this.searchModel.invoiceNo) {
        delete this.searchModel.invoiceNo;
      } else {
        this.searchModel.invoiceNo = this.searchModel.invoiceNo.trim();
        if (this.searchModel.invoiceNo.length === 0) {
          delete this.searchModel.invoiceNo;
        }
      }

      this._commonBillingService.getCustomerInvoices(this.searchModel).subscribe(rs => {
        if (rs.mess.code === HTTP_CODE.SUCCESS) {
          this.dataModel.dataSource = rs.data.listData;
          this.totalRecord = rs.data.count;
          this.isLoading = false;
        }
      });
    }
  }

  ngOnChanges() {
    this.getData();
  }

  onViewInvoice(item) {
    this._commonBillingService.postInvoiceFile(item.custInvoiceId).subscribe(
      data => {
        const contentDisposition = data.headers.get('content-disposition');
        const filename = contentDisposition
          .split(';')[1]
          .split('filename')[1]
          .split('=')[1]
          .trim();
        saveAs(data.body, filename);
      },
      err => {
        this._toastrService.warning(this._translateService.instant('common.notify.fail'));
      }
    );
  }
}
