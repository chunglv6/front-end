import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core/app-config';
import { SelectOptionModel } from '@app/core/models/common.model';
import { CategoryManagementService } from '@app/core/services/category/category-management.service';
import { CommonCRMService, HTTP_CODE, STATUS } from '@app/shared';
import { ValidationService } from '@app/shared/common/validation.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-base-impact-customer',
  templateUrl: './base-impact-customer.component.html',
  styleUrls: ['./base-impact-customer.component.scss']
})
export class BaseImpactCustomerComponent extends BaseComponent implements OnInit {
  header;
  id: number;
  formImpact: FormGroup;
  listStatus = STATUS;
  listActType = [];
  listActReason = [];
  listOptionLicense: SelectOptionModel[] = [] as SelectOptionModel[];

  constructor(
    public actr: ActivatedRoute,
    private fb: FormBuilder,
    protected _toastr: ToastrService,
    protected _translate: TranslateService,
    public dialog?: MtxDialog,
    @Inject(MAT_DIALOG_DATA) public dataDialog?: any,
    public dialogOpen?: MatDialogRef<TemplateRef<BaseImpactCustomerComponent>>,
    public dialogRef?: MatDialogRef<TemplateRef<BaseImpactCustomerComponent>>,
    private _commonCrmService?: CommonCRMService,
    private categoryManagementService?: CategoryManagementService,
  ) {
    super(actr, _commonCrmService, RESOURCE.CATEGORY, _toastr, _translate, dialog, dialogRef);

    this.formImpact = this.fb.group({
      actTypeId: ['', Validators.required],
      documentTypeId: ['', Validators.required],
      status: ['', Validators.required],
      description: ['', [Validators.maxLength(510), ValidationService.cannotWhiteSpace]]
    });
  }

  ngOnInit() {
    this.getListActType();
    this.getListDocumentTypeObject();
    this.header = this._translate.instant('category.add-impact-license');
  }

  getListActType() {
    this._commonCrmService.getActionType().subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.listActType = res.data.map(val => {
          return {
            code: val.code,
            name: val.name,
            actTypeId: val.actTypeId,
          };
        });
      }
    });
  }

  getListDocumentTypeObject() {
    this._commonCrmService.getListDocumentTypeAll().subscribe(res => {
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
      actTypeId: this.formImpact.controls.actTypeId.value,
      documentTypeId: this.formImpact.controls.documentTypeId.value,
      status: this.formImpact.controls.status.value,
      description: this.formImpact.controls.description.value,
    };

    this.categoryManagementService.addActTypeMapping(body).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this._toastr.success(this._translate.instant('category.add-success-impact-license'));
        this.onClosePopup();
      } else {
        this._toastr.warning(res.mess.description);
      }
    }, error => {
      this._toastr.error(this._translate.instant('common.notify.fail'));
    });
  }
}
