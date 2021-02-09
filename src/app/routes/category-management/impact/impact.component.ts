import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { RESOURCE } from '@app/core/app-config';
import {
  OBJECTS_ACTION,
  IS_OCS,
  STATUS_VEHICLE,
  HTTP_CODE,
  STATUS,
  LIST_OCS,
} from '@app/shared/constant/common.constant';
import { CommonCRMService } from '@app/shared/services/common-crm.service';
import { BaseImpactComponent } from './base-impact/base-impact.component';
import { MtxDialog } from '@ng-matero/extensions/dialog';
import { CategoryManagementService } from '@app/core/services/category/category-management.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'impact',
  templateUrl: './impact.component.html',
  styleUrls: ['./impact.component.scss'],
})
export class ImpactComponent extends BaseComponent implements OnInit {

  constructor(
    public actr: ActivatedRoute,
    private fb: FormBuilder,
    public dialog: MtxDialog,
    private categoryManagementService: CategoryManagementService,
    protected _translateService: TranslateService,
    protected _toastrService: ToastrService,
    private _commonCRMService?: CommonCRMService
  ) {
    super(actr, null, RESOURCE.CATEGORY, null, _translateService);

    this.formSearch = this.fb.group({
      code: [''],
      name: [''],
      status: [''],
      isOcs: [''],
      actObject: [''],
    });
  }
  objAction = OBJECTS_ACTION;
  isOcs = IS_OCS;
  status = STATUS_VEHICLE;
  actTypeId: number;
  listStatus = STATUS;
  listIsOcs = LIST_OCS;

  actionType = [];
  actionObject = [
    { value: OBJECTS_ACTION.TATCA, label: this._translateService.instant('common.default-select') },
    {
      value: OBJECTS_ACTION.KHACHHANG,
      label: this._translateService.instant('search-information.custommer'),
    },
    {
      value: OBJECTS_ACTION.HOPDONG,
      label: this._translateService.instant('search-information.contract'),
    },
    {
      value: OBJECTS_ACTION.PHUONGTIEN,
      label: this._translateService.instant('search-information.vehicle'),
    },
    {
      value: OBJECTS_ACTION.THERFID,
      label: this._translateService.instant('search-information.rfid'),
    },
  ];

  ngOnInit() {
    this.isLoading = true;
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'category.code', field: 'code', width: '4%' },
      { i18n: 'category.impactName', field: 'name' },
      { i18n: 'category.object', field: 'actObject', type: 'custom' },
      { i18n: 'category.ocs', field: 'isOcs', type: 'custom' },
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
  }
  selectionChangeActionType() {
    if (this.searchModel.actObject) {
      this._commonCRMService.getActionType(this.searchModel.actObject).subscribe(rs => {
        if (rs.mess.code === HTTP_CODE.SUCCESS) {
          this.actionType = rs.data.map(val => {
            return {
              code: val.actTypeId,
              value: val.name,
            };
          });
        }
      });
    }
  }

  handleSearchModelTrim() {
    if (this.formSearch.get('code').value)
      this.searchModel.code = this.formSearch.get('code').value;
    else delete this.searchModel.code;

    if (this.formSearch.get('name').value)
      this.searchModel.name = this.formSearch.get('name').value;
    else delete this.searchModel.name;

    if (this.formSearch.get('isOcs').value)
      this.searchModel.isOcs = this.formSearch.get('isOcs').value;
    else delete this.searchModel.isOcs;

    if (this.formSearch.get('status').value)
      this.searchModel.status = this.formSearch.get('status').value;
    else delete this.searchModel.status;

    if (this.formSearch.get('actObject').value)
      this.searchModel.actObject = this.formSearch.get('actObject').value;
    else delete this.searchModel.actObject;
  }

  getData() {
    this.isLoading = true;
    this.handleSearchModelTrim();
    this.categoryManagementService.searchActType(this.searchModel).toPromise().then(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        this.isLoading = false;
        this.totalRecord = res.data.count;
        this.dataModel.dataSource = res.data.listData;
      }
    });
  }

  editImpact(record) {
    const dialogRef = this.dialog.open(
      {
        width: '60%',
        panelClass: 'my-dialog',
        disableClose: true,
        data: record
      },
      BaseImpactComponent
    );
    dialogRef.afterClosed().subscribe(rs => {
      this.onSearch();
    });
  }

  addImpact() {
    const dialogRef = this.dialog.open(
      {
        width: '60%',
        panelClass: 'my-dialog',
        disableClose: true,
        data: status,
      },
      BaseImpactComponent
    );
    dialogRef.afterClosed().subscribe(rs => {
      this.onSearch();
    });
  }
}
