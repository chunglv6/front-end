import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ContractService, RESOURCE } from '@app/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contract-list',
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.css'],
})
export class ContractListComponent extends BaseComponent
  implements OnInit, OnChanges, AfterContentChecked {
  @Input() id: number;
  signDateForm = new FormControl();
  expDateForm = new FormControl();
  constructor(
    protected _toastr: ToastrService,
    private _contractService: ContractService,
    protected _translateService: TranslateService,
    public _dialog?: MtxDialog,
    public _actr?: ActivatedRoute,
    private cdref?: ChangeDetectorRef
  ) {
    super(_actr, _contractService, RESOURCE.CONTRACT, _toastr, _translateService);
  }
  ngAfterContentChecked(): void {
    this.cdref.detectChanges();
  }
  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'contract.code', field: 'contractNo' },
      { i18n: 'contract.create', field: 'signName' },
      { i18n: 'contract.signDate', field: 'signDate', type: 'datetime' },
      { i18n: 'common.status', field: 'status', type: 'custom' },
    ];
  }
  getData() {
    if (!this.signDateForm.hasError('matDatepickerMax')) {
      this.isLoading = true;
      this.searchModel.startDate = this.signDateForm.value
        ? moment(this.signDateForm.value)
            .format(COMMOM_CONFIG.DATE_FORMAT)
            .toString()
        : null;
      this.searchModel.endDate = this.expDateForm.value
        ? moment(this.expDateForm.value)
            .format(COMMOM_CONFIG.DATE_FORMAT)
            .toString()
        : null;
      this._contractService
        .searchAllContractsByCustomer(this.searchModel, this.id)
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
      this.getData();
    } else {
      this.dataModel.dataSource = [];
      this.totalRecord = 0;
    }
  }
}
