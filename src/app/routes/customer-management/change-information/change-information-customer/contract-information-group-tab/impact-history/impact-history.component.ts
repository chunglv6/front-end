import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContractService, RESOURCE } from '@app/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'impact-history',
  templateUrl: './impact-history.component.html',
  styleUrls: ['./impact-history.component.css'],
})
export class ImpactHistoryComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() node: any;
  dataSourceTree: [];
  startDate;
  endDate;
  constructor(
    protected _activatedRoute: ActivatedRoute,
    protected _translateService: TranslateService,
    protected _toastrService: ToastrService,
    private _contractService?: ContractService
  ) {
    super(_activatedRoute, _contractService, RESOURCE.CONTRACT, _toastrService, _translateService);
  }

  ngOnInit() {
    this.columns = [
      { header: this._translateService.instant('common.orderNumber'), field: 'orderNumber' },
      { header: this._translateService.instant('action_audit.actionType'), field: 'actionType' },
      { header: this._translateService.instant('action_audit.createBy'), field: 'actionUserName' },
      { header: this._translateService.instant('action_audit.create'), field: 'actionDate' },
      { header: this._translateService.instant('action_audit.requestBy'), field: 'userName' },
      { header: this._translateService.instant('action_audit.reason'), field: 'reason' },
      { header: this._translateService.instant('action_audit.prevContent'), field: 'oldValue' },
      { header: this._translateService.instant('action_audit.backContent'), field: 'newValue' },
    ];
    super.mapColumn();
  }
  public processSearchActionContract(): void {
    this.isLoading = true;
    this.searchModel.startDate = this.startDate
      ? moment(this.startDate)
        .format(COMMOM_CONFIG.DATE_FORMAT)
        .toString()
      : null;
    this.searchModel.endDate = this.endDate
      ? moment(this.endDate)
        .format(COMMOM_CONFIG.DATE_FORMAT)
        .toString()
      : null;
    this._contractService.searchActionContractHistories(this.searchModel, this.node.custId, this.node.contractId)
      .subscribe(res => {
        if (res.mess.code == 1) {
          this.dataSourceTree = res.data.listData;
          this.isLoading = false;
        } else {
          this.toastr.error(this.translateService.instant('common.notify.fail'));
        }
      });
  }
  ngOnChanges() {
    this.processSearchActionContract();
  }
}
