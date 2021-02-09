import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'invoice-history',
  templateUrl: './invoice-history.component.html',
  styleUrls: ['./invoice-history.component.css']
})
export class InvoiceHistoryComponent extends BaseComponent implements OnInit {
  constructor(
    protected _activatedRoute: ActivatedRoute,
    protected _translateService: TranslateService,
    protected _toastrService: ToastrService,
  ) {
    super(_activatedRoute, null, RESOURCE.CONTRACT, _toastrService, _translateService)
  }
  ngOnInit() {
    this.columns = [
      { header: this._translateService.instant('common.orderNumber'), field: 'orderNumber' },
      { header: this._translateService.instant('contract.billing.signContract'), field: 'signContract' },
      { header: this._translateService.instant('contract.billing.codeContract'), field: 'codeContract' },
      { header: this._translateService.instant('contract.billing.dateContract'), field: 'dateContract' },
      { header: this._translateService.instant('contract.billing.priceContract'), field: 'priceContract' },
      { header: `${this._translateService.instant('contract.billing.station')}/${this._translateService.instant('contract.billing.phase')}`, field: 'stationPhase' },
      { header: this._translateService.instant('customer-management.vehiclesHaveRFIDTable.actionView'), field: 'view' }
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
