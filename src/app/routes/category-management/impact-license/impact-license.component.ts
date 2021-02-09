import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { SelectOptionModel } from '@app/core/models/common.model';
import { CommonCRMService, HTTP_CODE, SharedDirectoryService, STATUS, STATUS_VEHICLE } from '@app/shared';
import { RESOURCE } from '@app/core';
import { CategoryManagementService } from '@app/core/services/category/category-management.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { MtxDialog } from '@ng-matero/extensions';
import { BaseImpactLicenseComponent } from './base-impact-license/base-impact-license.component';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ConfirmBoldFormDialogModel, ConfirmDialogBoldFormComponent } from '@app/shared/components/confirm-dialog-bold-form/confirm-dialog-bold-form.component';
import { ConfirmCustomerComponent, CustomerModelConfirm } from './confirm/confirm.component';

@Component({
  selector: 'app-impact-license',
  templateUrl: './impact-license.component.html',
  styleUrls: ['./impact-license.component.scss']
})
export class ImpactLicenseComponent extends BaseComponent implements OnInit {
  id: number;
  listStatus = STATUS;
  status = STATUS_VEHICLE;
  listOptionCustomerType: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionLicense = [];
  constructor(
    public actr: ActivatedRoute,
    private fb: FormBuilder,
    private _sharedDirectoryService: SharedDirectoryService,
    private categoryManagementService: CategoryManagementService,
    private _commonCRMService: CommonCRMService,
    protected _translateService: TranslateService,
    protected _toastrService: ToastrService,
    public dialog: MtxDialog,
  ) {
    super(actr, null, RESOURCE.CATEGORY, null, _translateService, dialog);

    this.formSearch = this.fb.group({
      custTypeId: [''],
      documentTypeId: [''],
      status: [''],
    });
  }

  ngOnInit() {
    this.isLoading = true;
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'category.license-code', field: 'documentTypeCode' },
      { i18n: 'category.license-name', field: 'documentTypeName' },
      { i18n: 'category.cust-type-name', field: 'custTypeName' },
      { i18n: 'category.status', field: 'status', type: 'custom' },
      { i18n: 'category.note', field: 'description', width: '35%' },
      { i18n: 'category.creat-date', field: 'createDate', type: 'datetime' },
      {
        i18n: 'common.action',
        field: 'actions',
        width: '100px',
        type: 'custom'
      },
    ];
    this.getListCustomerType();
    this.getListDocumentTypeObject();
    this.getData();
  }

  getListCustomerType() {
    this._sharedDirectoryService.getListCustomerType().subscribe(res => {
      this.listOptionCustomerType = res.data.map(val => {
        return {
          code: val.cust_type_id,
          value: val.name
        };
      });
    });
  }

  getListDocumentTypeObject() {
    this._commonCRMService.getListDocumentTypeAll().subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.listOptionLicense = res.data.map(val => {
          return {
            value: val.val,
            document_type_id: val.id,
          };
        });
        this.listOptionLicense.unshift({
          value: this._translateService.instant('common.default-select'),
          document_type_id: -1,
        });
      }
    });
  }

  handleSearchModelTrim() {
    if (this.formSearch.get('custTypeId').value)
      this.searchModel.custTypeId = this.formSearch.get('custTypeId').value;
    else delete this.searchModel.custTypeId;

    if (this.formSearch.get('documentTypeId').value)
      this.searchModel.documentTypeId = this.formSearch.get('documentTypeId').value == -1 ? null : this.formSearch.get('documentTypeId').value;
    else delete this.searchModel.documentTypeId;

    if (this.formSearch.get('status').value)
      this.searchModel.status = this.formSearch.get('status').value;
    else delete this.searchModel.status;
  }

  getData() {
    if (this.searchModel.documentTypeId == -1) {
      this.searchModel.documentTypeId = null;
    }
    this.isLoading = true;
    this.handleSearchModelTrim();
    this.categoryManagementService.searchCustTypeMapping(this.searchModel).toPromise().then(res => {
      this.isLoading = false;
      this.totalRecord = res.data.count;
      this.dataModel.dataSource = res.data.listData;
    });
  }

  addImpact() {
    const dialogRef = this.dialog.open(
      {
        width: '60%',
        panelClass: 'my-dialog',
        disableClose: true,
        data: status
      },
      BaseImpactLicenseComponent
    );
    dialogRef.afterClosed().subscribe(rs => {
      this.onSearch();
    });
  }

  deleteImpact(item) {
    const dialogData: CustomerModelConfirm = {
      title: this._translateService.instant('common.button.confirm'),
      messageFirst: this._translateService.instant('category.delete-impact-customer'),
      messageBold: item.documentTypeName,
      messageLast: '?',
      nameButtonConfirm: this._translateService.instant('common.button.delete'),
      messageSecond: item.custTypeName
    }
    const dialogRef = this.dialog.originalOpen(ConfirmCustomerComponent, {
      width: '28%',
      disableClose: true,
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        if (item.id) {
          // nếu có trong db thì xóa gọi api
          this.categoryManagementService.deleteCustTypeMapping(item.id).subscribe(res => {
            if (res.mess.code == HTTP_CODE.SUCCESS) {
              this._toastrService.success(this._translateService.instant('category.delete-success-impact-customer'));
              this.onSearch();
            } else {
              this._toastrService.warning(res.mess.description);
            }
          });
        }
      }
    });
  }

  moveStatus(item) {
    const dialogData: CustomerModelConfirm = {
      title: this._translateService.instant('common.button.confirm'),
      messageFirst: this._translateService.instant('category.move-impact-customer'),
      messageBold: item.documentTypeName,
      messageLast: '?',
      nameButtonConfirm: this._translateService.instant('category.btn-change-status'),
      messageSecond: item.custTypeName
    };
    const dialogRef = this.dialog.originalOpen(ConfirmCustomerComponent, {
      width: '28%',
      panelClass: 'my-dialog',
      disableClose: true,
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        if (item.id) {
          this.categoryManagementService.moveCustTypeMapping(item.id).subscribe(res => {
            if (res.mess.code == HTTP_CODE.SUCCESS) {
              this._toastrService.success(this._translateService.instant('category.success-move-impact-customer'));
              this.getData();
            } else {
              this._toastrService.warning(res.mess.description);
            }
          });
        }
      }
    });
  }
}
