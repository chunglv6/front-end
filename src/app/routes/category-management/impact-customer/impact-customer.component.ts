import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';
import { CategoryManagementService } from '@app/core/services/category/category-management.service';
import { CommonCRMService, HTTP_CODE, STATUS, STATUS_VEHICLE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { BaseImpactCustomerComponent } from './base-impact-customer/base-impact-customer.component';
import { ConfirmLicenseComponent, CustomerModelConfirm } from './confirm/confirm.component';

@Component({
  selector: 'app-impact-customer',
  templateUrl: './impact-customer.component.html',
  styleUrls: ['./impact-customer.component.scss']
})
export class ImpactCustomerComponent extends BaseComponent implements OnInit {
  listActReason = [];
  listStatus = STATUS;
  status = STATUS_VEHICLE;
  listOptionLicense = [];
  listActType = [];

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
      { i18n: 'category.impact', field: 'actTypeName' },
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
    this.getListActType();
    this.getListDocumentTypeObject();
    this.getData();
  }

  getListActType() {
    this._commonCrmService.getActionType().subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.listActType = res.data.map(val => {
          return {
            name: val.name,
            actTypeId: val.actTypeId,
          };
        });
        this.listActType.unshift({
          name: this._translateService.instant('common.default-select'),
          actTypeId: -1,
        });
      }
    });
  }

  getListDocumentTypeObject() {
    this._commonCrmService.getListDocumentTypeAll().subscribe(res => {
      this.listOptionLicense = res.data.map(val => {
        return {
          id: val.id,
          value: val.val
        };
      });
      this.listOptionLicense.unshift({
        value: this._translateService.instant('common.default-select'),
        id: -1,
      });
    });
  }

  handleSearchModelTrim() {
    if (this.formSearch.get('actTypeId').value)
      this.searchModel.actTypeId = this.formSearch.get('actTypeId').value == -1 ? null : this.formSearch.get('actTypeId').value;
    else delete this.searchModel.actTypeId;

    if (this.formSearch.get('documentTypeId').value)
      this.searchModel.documentTypeId = this.formSearch.get('documentTypeId').value == -1 ? null : this.formSearch.get('documentTypeId').value;
    else delete this.searchModel.documentTypeId;

    if (this.formSearch.get('status').value)
      this.searchModel.status = this.formSearch.get('status').value;
    else delete this.searchModel.status;
  }

  getData() {
    if (this.searchModel.actTypeId == -1) {
      this.searchModel.actTypeId = null;
    }
    if (this.searchModel.documentTypeId == -1) {
      this.searchModel.documentTypeId = null;
    }
    this.isLoading = true;
    this.handleSearchModelTrim();
    this.categoryManagementService.searchActTypeMapping(this.searchModel).subscribe(res => {
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
      BaseImpactCustomerComponent
    );
    dialogRef.afterClosed().subscribe(rs => {
      this.onSearch();
    });
  }

  moveStatus(item) {
    const dialogData: CustomerModelConfirm = {
      title: this._translateService.instant('common.button.confirm'),
      messageFirst: this._translateService.instant('category.move-impact-license'),
      messageBold: item.documentTypeName,
      messageLast: '?',
      nameButtonConfirm: this._translateService.instant('category.btn-change-status'),
      messageSecond: item.actTypeName
    };
    const dialogRef = this.dialog.originalOpen(ConfirmLicenseComponent, {
      width: '28%',
      panelClass: 'my-dialog',
      disableClose: true,
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        if (item.id) {
          this.categoryManagementService.moveActTypeMapping(item.id).subscribe(res => {
            if (res.mess.code == HTTP_CODE.SUCCESS) {
              this._toastrService.success(this._translateService.instant('category.success-move-impact-license'));
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
