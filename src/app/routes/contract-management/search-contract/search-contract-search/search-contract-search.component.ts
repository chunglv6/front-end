//author hieulx

import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { RESOURCE } from '@app/core/app-config';
import { SelectOptionModel } from '@app/core/models/common.model';
import { ContractService } from '@app/core/services/contract/contract.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { SharedDirectoryService } from '@app/shared/services/shared-directory.service';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions/dialog';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'search-contract-search',
  templateUrl: './search-contract-search.component.html',
  styleUrls: ['./search-contract-search.component.scss'],
})
export class SearchContractSearchComponent extends BaseComponent implements OnInit {
  listOptionCustomerType: SelectOptionModel[] = [] as SelectOptionModel[];
  startDate = null;
  endDate = null;

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  selectContract: any = {};

  constructor(
    private _sharedDirectoryService: SharedDirectoryService,
    public actr: ActivatedRoute,
    private fb: FormBuilder,
    public dialog: MtxDialog,
    private contractService: ContractService,
    protected translateService: TranslateService,
    protected _toastrService: ToastrService,
    protected _router: Router
  ) {
    super(actr, contractService, RESOURCE.CONTRACT, _toastrService, translateService, dialog);

    this.formSearch = this.fb.group({
      contractNo: [''],
      plateNumber: [''],
      phoneNumber: [''],
      documentNumber: [''],
      custId: [''],
      custName: [''],
      custTypeId: [''],
      startDate: [''],
      endDate: [''],
    });
  }

  ngOnInit() {
    this.isLoading = true;
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'contract.code', field: 'contractNo' },
      { i18n: 'customer.code', field: 'custId' },
      { i18n: 'customer.name', field: 'custName' },
      { i18n: 'contract.create', field: 'signName' },
      { i18n: 'contract.signDate', field: 'signDate', type: 'datetime' },
      {
        i18n: 'common.action',
        field: 'actions',
        type: 'custom'
      },
    ];
    this.getListCustomerType();
    this.getData();
  }

  handleSearchModelTrim() {
    this.searchModel.startDate = this.startDate ? moment(this.startDate, COMMOM_CONFIG.DATE_FORMAT).format(COMMOM_CONFIG.DATE_FORMAT).toString() : null;
    this.searchModel.endDate = this.endDate ? moment(this.endDate).format(COMMOM_CONFIG.DATE_FORMAT).toString() : null;

    if (this.formSearch.get('contractNo').value)
      this.searchModel.contractNo = this.formSearch.get('contractNo').value;
    else delete this.searchModel.contractNo;

    if (this.formSearch.get('plateNumber').value)
      this.searchModel.plateNumber = this.formSearch.get('plateNumber').value;
    else delete this.searchModel.plateNumber;

    if (this.formSearch.get('phoneNumber').value)
      this.searchModel.phoneNumber = this.formSearch.get('phoneNumber').value;
    else delete this.searchModel.phoneNumber;

    if (this.formSearch.get('documentNumber').value)
      this.searchModel.documentNumber = this.formSearch.get('documentNumber').value;
    else delete this.searchModel.documentNumber;

    if (this.formSearch.get('custId').value)
      this.searchModel.custId = this.formSearch.get('custId').value;
    else delete this.searchModel.custId;

    if (this.formSearch.get('custName').value)
      this.searchModel.custName = this.formSearch.get('custName').value;
    else delete this.searchModel.custName;

    if (this.formSearch.get('custTypeId').value)
      this.searchModel.custTypeId = this.formSearch.get('custTypeId').value;
    else delete this.searchModel.custTypeId;
  }

  getData() {
    if (this.formSearch.valid) {
      this.isLoading = true;
      this.handleSearchModelTrim();
      this.contractService.searchAllContracts(this.searchModel).subscribe(rs => {
        this.isLoading = false;
        this.dataModel.dataSource = rs.data.listData;
        this.totalRecord = rs.data.count;
      })
    }
  }

  getListCustomerType() {
    this._sharedDirectoryService.getListCustomerType().subscribe(res => {
      this.listOptionCustomerType = res.data.map(val => {
        return {
          code: val.cust_type_id,
          value: val.name
        }
      });
    });
  }

  viewDetail(item) {
    this._router.navigate(['customer-management', 'search']);
  }
}
