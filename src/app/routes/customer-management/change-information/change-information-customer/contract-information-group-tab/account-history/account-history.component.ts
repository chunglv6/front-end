import { Component, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'account-history',
  templateUrl: './account-history.component.html',
  styleUrls: ['./account-history.component.css']
})
export class AccountHistoryComponent extends BaseComponent implements OnInit, OnChanges {
  changeTypeList = [];
  constructor(
    protected _activatedRoute: ActivatedRoute,
    protected _translateService: TranslateService,
    protected _toastrService: ToastrService,
  ) {
    super(_activatedRoute, null, RESOURCE.CONTRACT, _toastrService, _translateService);
  }

  ngOnInit() {
    this.columns = [
      { header: this._translateService.instant('common.orderNumber'), field: 'orderNumber' },
      { header: this._translateService.instant('contract.account.changeType'), field: 'changeType' },
      { header: this._translateService.instant('contract.account.exchangeDate'), field: 'exchangeDate' },
      { header: this._translateService.instant('contract.account.newBalance'), field: 'newBalance' },
      { header: this._translateService.instant('contract.account.oldBalance'), field: 'oldBalance' },
      { header: this._translateService.instant('contract.account.exchangeType'), field: 'exchangeType' },
      { header: this._translateService.instant('contract.account.transactionAmount'), field: 'transactionAmount' },
      { header: this._translateService.instant('contract.description'), field: 'description' }
    ];
    super.mapColumn();
    this.getData();
  }
  getData() {

  }
  ngOnChanges() {
    this.getData();
  }
}
