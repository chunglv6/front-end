import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core/app-config';
import { CategoryManagementService } from '@app/core/services/category/category-management.service';
import { HTTP_CODE, STATUS, STATUS_VEHICLE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { CommonCRMService } from '@app/shared/services/common-crm.service';
import { MtxDialog } from '@ng-matero/extensions/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { BaseImpactReasonComponent } from './base-impact-reason/base-impact-reason.component';

@Component({
  selector: 'app-reason-impact',
  templateUrl: './reason-impact.component.html',
  styleUrls: ['./reason-impact.component.scss']
})
export class ReasonImpactComponent extends BaseComponent implements OnInit {

  listActType = [];
  status = STATUS_VEHICLE;
  listStatus = STATUS;

  constructor(
    public actr: ActivatedRoute,
    private fb: FormBuilder,
    private _commonCrmService: CommonCRMService,
    private categoryManagementService: CategoryManagementService,
    protected _translateService: TranslateService,
    protected _toastrService: ToastrService,
    public dialog: MtxDialog,
  ) {
    super(actr, null, RESOURCE.CATEGORY, null, _translateService);

    this.formSearch = this.fb.group({
      actTypeId: [''],
      code: [''],
      name: [''],
      status: [''],
    });
  }

  ngOnInit() {
    this.isLoading = true;
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'category.impact', field: 'actTypeName' },
      { i18n: 'category.reasonID', field: 'code', width: '5%' },
      { i18n: 'category.reasonName', field: 'name' },
      { i18n: 'category.status', field: 'status', type: 'custom' },
      { i18n: 'category.note', field: 'description', width: '35%' },
      { i18n: 'category.creat-date', field: 'createDate', type: 'datetime' },
      {
        i18n: 'common.action',
        field: 'actions',
        width: '70px',
        type: 'custom'
      },
    ];
    this.isLoading = false;
    this.getData();
    this.getListActType();
  }

  getListActType() {
    this._commonCrmService.getActionType().subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        this.listActType = res.data.map(val => {
          return {
            name: val.name,
            act_type_id: val.actTypeId,
          };
        });
        this.listActType.unshift({
          name: this._translateService.instant('common.default-select'),
          act_type_id: -1,
        });
      }
    });
  }

  handleSearchModelTrim() {
    if (this.formSearch.get('actTypeId').value)
      this.searchModel.actTypeId = this.formSearch.get('actTypeId').value == -1 ? null : this.formSearch.get('actTypeId').value;
    else delete this.searchModel.actTypeId;

    if (this.formSearch.get('code').value)
      this.searchModel.code = this.formSearch.get('code').value;
    else delete this.searchModel.code;

    if (this.formSearch.get('name').value)
      this.searchModel.name = this.formSearch.get('name').value;
    else delete this.searchModel.name;

    if (this.formSearch.get('status').value)
      this.searchModel.status = this.formSearch.get('status').value;
    else delete this.searchModel.status;
  }

  getData() {
    this.isLoading = true;
    this.handleSearchModelTrim();
    this.categoryManagementService.searchActReason(this.searchModel).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        this.isLoading = false;
        this.totalRecord = res.data.count;
        this.dataModel.dataSource = res.data.listData;
      }
    })
  }

  editImpact(record) {
    const dialogRef = this.dialog.open(
      {
        width: '50%',
        panelClass: 'my-dialog',
        disableClose: true,
        data: record
      },
      BaseImpactReasonComponent
    );
    dialogRef.afterClosed().subscribe(res => {
      this.onSearch();
    });
  }

  addImpact() {
    const dialogRef = this.dialog.open(
      {
        width: '50%',
        panelClass: 'my-dialog',
        disableClose: true,
        data: status
      },
      BaseImpactReasonComponent
    );
    dialogRef.afterClosed().subscribe(res => {
      this.onSearch();
    });
  }
}
