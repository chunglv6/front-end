import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';
import { ContractService } from '@app/core/services/contract/contract.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'transaction-history',
  templateUrl: './transaction-history.component.html',
})
export class TransactionHistoryComponent extends BaseComponent implements OnInit {
  @Input() dataSelect: any;
  constructor(
    protected _toastr: ToastrService,
    private _contractService: ContractService,
    private fb: FormBuilder,
    protected _translateService: TranslateService,
    public _dialog?: MtxDialog,
    public _actr?: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
    this.columns = [];
    this.getData();
  }
  getData() {
    this.isLoading = false;
  }
  onSignNewContract() { }
}
