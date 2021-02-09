import { Component, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contract-account-history',
  templateUrl: './contract-account-history.component.html',
  styleUrls: ['./contract-account-history.component.css'],
})
export class ContractAccountHistoryComponent extends BaseComponent implements OnInit, OnChanges {
  changeTypeList = [];
  constructor(
    protected _activatedRoute: ActivatedRoute,
    protected _translateService: TranslateService,
    protected _toastrService: ToastrService
  ) {
    super(_activatedRoute, null, RESOURCE.CONTRACT, _toastrService, _translateService);
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'contract.account.changeType', field: 'changeType' },
      { i18n: 'contract.account.exchangeDate', field: 'exchangeDate' },
      { i18n: 'contract.account.newBalance', field: 'newBalance' },
      { i18n: 'contract.account.oldBalance', field: 'oldBalance' },
      { i18n: 'contract.account.exchangeType', field: 'exchangeType' },
      { i18n: 'contract.account.transactionAmount', field: 'transactionAmount' },
      { i18n: 'contract.description', field: 'description' },
    ];
    super.mapColumn();
  }
  getData() {}
  ngOnChanges() {
    this.getData();
  }
}
