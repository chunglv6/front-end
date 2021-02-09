import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core/app-config';
import { SelectOptionCategory, SelectOptionModel } from '@app/core/models/common.model';
import { CategoryManagementService } from '@app/core/services/category/category-management.service';
import { ACTION_TYPE, CommonCRMService, HTTP_CODE, SharedDirectoryService, STATUS } from '@app/shared';
import { ValidationService } from '@app/shared/common/validation.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogModel, ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { BaseImpactComponent } from '../../impact/base-impact/base-impact.component';

@Component({
  selector: 'app-base-impact-license',
  templateUrl: './base-impact-license.component.html',
  styleUrls: ['./base-impact-license.component.scss']
})
export class BaseImpactLicenseComponent extends BaseComponent implements OnInit {
  header;
  id: number;
  formImpact: FormGroup;
  listStatus = STATUS;
  listOptionCustomerType: SelectOptionCategory[] = [] as SelectOptionCategory[];
  listOptionLicense: SelectOptionModel[] = [] as SelectOptionModel[];

  constructor(
    private _sharedDirectoryService: SharedDirectoryService,
    public actr: ActivatedRoute,
    private fb: FormBuilder,
    protected _toastr: ToastrService,
    protected _translate: TranslateService,
    public dialog?: MtxDialog,
    @Inject(MAT_DIALOG_DATA) public dataDialog?: any,
    public dialogOpen?: MatDialogRef<TemplateRef<BaseImpactLicenseComponent>>,
    public dialogRef?: MatDialogRef<TemplateRef<BaseImpactLicenseComponent>>,
    private _commonCRMService?: CommonCRMService,
    private categoryManagementService?: CategoryManagementService,
  ) {
    super(actr, _commonCRMService, RESOURCE.CATEGORY, _toastr, _translate, dialog, dialogRef);

    this.formImpact = this.fb.group({
      custTypeName: ['', Validators.required],
      documentTypeName: ['', Validators.required],
      status: ['', Validators.required],
      description: ['', [Validators.maxLength(510), ValidationService.cannotWhiteSpace]]
    });
  }

  ngOnInit() {
    this.getListCustomerType();
    this.getListDocumentTypeObject();
    if (this.dataDialog.data.record) {
      this.header = this._translate.instant('category.edit-impact-customer');
      this.id = this.dataDialog.data.record.id;
    } else {
      this.header = this._translate.instant('category.add-impact-customer');
    }
  }

  getListCustomerType() {
    this._sharedDirectoryService.getListCustomerType().subscribe(res => {
      this.listOptionCustomerType = res.data.map(val => {
        return {
          cust_type_id: val.cust_type_id,
          name: val.name,
          code: val.code
        };
      });
    });
  }

  getListDocumentTypeObject() {
    this._commonCRMService.getListDocumentTypeAll().subscribe(res => {
      this.listOptionLicense = res.data.map(val => {
        return {
          id: val.id,
          value: val.val,
          code: val.code,
        };
      });
    });
  }

  resetAllForm() {
    this.formImpact.reset();
  }

  onSave() {
    let statusImp;
    if (this.formImpact.controls.status.value == '1') {
      statusImp = 1;
    } else if (this.formImpact.controls.status.value == '0') {
      statusImp = 0;
    }

    if (this.formImpact.controls.description.value) {
      this.formImpact.controls.description.setValue(this.formImpact.controls.description.value.trim());
    }

    const body = {
      custTypeId: this.formImpact.controls.custTypeName.value,
      documentTypeId: this.formImpact.controls.documentTypeName.value,
      status: this.formImpact.controls.status.value,
      description: this.formImpact.controls.description.value,
    };

    this.categoryManagementService.addCustTypeMapping(body).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this._toastr.success(this._translate.instant('category.add-success-impact-customer'));
        this.onClosePopup();
      } else {
        this._toastr.warning(res.mess.description);
      }
    }, error => {
      this._toastr.error(this._translate.instant('common.notify.fail'));
    });
  }
}
