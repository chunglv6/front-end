import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';
import { ContractService } from '@app/core/services/contract/contract.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { ACTION_TYPE, HTTP_CODE } from '@app/shared/constant/common.constant';
@Component({
  selector: 'app-contract-attach-list',
  templateUrl: './contract-attach-list.component.html',
  styleUrls: ['./contract-attach-list.component.css'],
})
export class ContractAttachListComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() contractId: number;
  displayedColumns = [];
  constructor(
    protected _activatedRoute: ActivatedRoute,
    protected _translateService: TranslateService,
    protected _toastrService: ToastrService,
    protected _contractService: ContractService
  ) {
    super(_activatedRoute, null, RESOURCE.CONTRACT, _toastrService, _translateService);
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'customer-management.updateProfileTable.documentType', field: 'documentTypeName' },
      { i18n: 'customer-management.updateProfileTable.documentName', field: 'fileName' },
      { i18n: 'common.action', field: 'action', type: 'custom' },
    ];
  }
  getData() {
    this.isLoading = true;
    this.searchModel.actTypeId = ACTION_TYPE.DANG_KY_KH;
    this._contractService
      .searchContractProfiles(this.searchModel, this.contractId)
      .subscribe(rs => {
        if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data) {
          this.dataModel.dataSource = rs.data.listData;
          this.totalRecord = rs.data.count;
          this.isLoading = false;
        }
      });
  }
  downLoadFile(item) {
    this._contractService.downloadProfileByContract(item.contractProfileId).subscribe(
      data => {
        saveAs(data);
      },
      err => {
        this._toastrService.warning(this._translateService.instant('common.notify.fail'));
      }
    );
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.contractId.currentValue) {
      this.getData();
    } else {
      this.dataModel.dataSource = [];
      this.totalRecord = 0;
    }
  }
}
