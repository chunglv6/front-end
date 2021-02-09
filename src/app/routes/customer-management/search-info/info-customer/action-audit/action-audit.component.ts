import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CustomerService } from '@app/core/services/customer/customer.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-action-audit',
  templateUrl: './action-audit.component.html',
  styleUrls: ['./action-audit.component.css'],
})
export class ActionAuditComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() id: number;
  constructor(
    protected _translateService: TranslateService,
    public _dialog?: MtxDialog,
    public _actr?: ActivatedRoute,
    protected _toastr?: ToastrService,
    protected _customerService?: CustomerService
  ) {
    super();
    this.formSearch = new FormGroup({
      startDateForm: new FormControl('', Validators.required),
      endDateForm: new FormControl('', Validators.required),
    });
  }
  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'action_audit.actionType', field: 'actionType' },
      { i18n: 'action_audit.createBy', field: 'actionUserName' },
      { i18n: 'action_audit.create', field: 'actionDate', type: 'datetime' },
      { i18n: 'action_audit.requestBy', field: 'userName' },
      { i18n: 'action_audit.reason', field: 'reason' },
    ];
    super.mapColumn();
  }
  getData() {
    if (this.formSearch.valid) {
      this.isLoading = true;
      this.searchModel.startDate = this.formSearch.controls.startDateForm.value
        ? moment(this.formSearch.controls.startDateForm.value)
            .format(COMMOM_CONFIG.DATE_FORMAT)
            .toString()
        : null;
      this.searchModel.endDate = this.formSearch.controls.endDateForm.value
        ? moment(this.formSearch.controls.endDateForm.value)
            .format(COMMOM_CONFIG.DATE_FORMAT)
            .toString()
        : null;
      this._customerService
        .searchActionCustomerHistories(this.searchModel, this.id)
        .subscribe(rs => {
          if (rs.mess.code === 1) {
            this.dataModel.dataSource = rs.data.listData;
            this.totalRecord = rs.data.count;
            this.isLoading = false;
          }
        });
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.id.currentValue) {
      this.dataModel.dataSource = [];
      this.totalRecord = 0;
    }
  }
}
