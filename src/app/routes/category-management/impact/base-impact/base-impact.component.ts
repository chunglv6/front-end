import { Component, OnInit, TemplateRef, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { RESOURCE } from '@app/core/app-config';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MtxDialog } from '@ng-matero/extensions';
import { CommonCRMService } from '@app/shared/services/common-crm.service';
import { OBJECTS_ACTION, STATUS, HTTP_CODE } from '@app/shared/constant/common.constant';
import { CategoryManagementService } from '@app/core/services/category/category-management.service';
import { ValidationService } from '@app/shared/common/validation.service';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmCloseDialog } from '@app/shared/models/confirm-close-dialog';
import { ConfirmCloseDialogComponent } from '@app/shared/components/confirm-close-dialog/confirm-close-dialog.component';

@Component({
  selector: 'base-impact',
  templateUrl: './base-impact.component.html',
  styleUrls: ['./base-impact.component.scss']
})
export class BaseImpactComponent extends BaseComponent implements OnInit {

  constructor(
    public actr: ActivatedRoute,
    private fb: FormBuilder,
    protected _toastr: ToastrService,
    protected _translate: TranslateService,
    public dialog?: MtxDialog,
    @Inject(MAT_DIALOG_DATA) public dataDialog?: any,
    public dialogRef?: MatDialogRef<TemplateRef<BaseImpactComponent>>,
    private _commonCRMService?: CommonCRMService,
    private categoryManagementService?: CategoryManagementService,
  ) {
    super(actr, _commonCRMService, RESOURCE.CATEGORY, _toastr, _translate, dialog, dialogRef);

    this.formImpact = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(255), ValidationService.cannotWhiteSpace]],
      name: ['', [Validators.required, Validators.maxLength(255), ValidationService.cannotWhiteSpace]],
      actObject: ['', Validators.required],
      isOcs: ['', Validators.required],
      status: ['', Validators.required],
      description: ['', [Validators.maxLength(510), ValidationService.cannotWhiteSpace]]
    });
  }
  formImpact: FormGroup;
  listStatus = STATUS;
  header;
  actTypeId: number;

  actionType = [];
  actionObject = [
    { value: OBJECTS_ACTION.KHACHHANG, label: this._translate.instant('search-information.custommer') },
    { value: OBJECTS_ACTION.HOPDONG, label: this._translate.instant('search-information.contract') },
    { value: OBJECTS_ACTION.PHUONGTIEN, label: this._translate.instant('search-information.vehicle') },
    { value: OBJECTS_ACTION.THERFID, label: this._translate.instant('search-information.rfid') },
  ];

  ngOnInit() {
    if (this.dataDialog.data) {
      this.actTypeId = this.dataDialog.data.actTypeId;
      this.header = this._translate.instant('category.edit-impact');
      this.getEditData(this.actTypeId);
    } else {
      this.header = this._translate.instant('category.add-impact');
    }
  }

  selectionChangeActionType() {
    if (this.searchModel.actObject) {
      this._commonCRMService.getActionType(this.searchModel.actObject).subscribe(rs => {
        if (rs.mess.code == 1) {
          this.actionType = rs.data.map(val => {
            return {
              code: val.actTypeId,
              value: val.name
            };
          });
        }
      });
    }
  }

  getEditData(actTypeId) {
    this.categoryManagementService.getDetailImpact(actTypeId).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.formImpact.controls.code.setValue(res.data.listData[0].code);
        this.formImpact.controls.name.setValue(res.data.listData[0].name);
        this.formImpact.controls.actObject.setValue(res.data.listData[0].actObject);
        this.formImpact.controls.isOcs.setValue(res.data.listData[0].isOcs);
        this.formImpact.controls.status.setValue(res.data.listData[0].status);
        this.formImpact.controls.description.setValue(res.data.listData[0].description);
      }
    });
  }

  resetAllForm() {
    if (this.dataDialog.data) {
      this.actTypeId = this.dataDialog.data.actTypeId;
      this.getEditData(this.actTypeId);
      this.formImpact.markAsPristine();
    } else {
      this.formImpact.reset();
    }
  }

  onSave() {
    if (this.formImpact.controls.name.value) {
      this.formImpact.controls.name.setValue(this.formImpact.controls.name.value.trim());
    }
    if (this.formImpact.controls.description.value) {
      this.formImpact.controls.description.setValue(this.formImpact.controls.description.value.trim());
    }

    const body = {
      code: this.formImpact.controls.code.value,
      name: this.formImpact.controls.name.value,
      status: this.formImpact.controls.status.value,
      isOcs: this.formImpact.controls.isOcs.value,
      actObject: this.formImpact.controls.actObject.value,
      description: this.formImpact.controls.description.value,
    };
    if (this.actTypeId) {
      this.categoryManagementService.editActType(body, this.actTypeId).subscribe(res => {
        if (res.mess.code == HTTP_CODE.SUCCESS) {
          this._toastr.success(this._translate.instant('category.success-edit-impact'));
          this.dialogRef.close();
        }
        else {
          this._toastr.warning(res.mess.description);
        }
      }, err => {
        this._toastr.error(this._translate.instant('common.500Error'));
      });
    } else {
      this.categoryManagementService.addActType(body).subscribe(res => {
        if (res.mess.code == HTTP_CODE.SUCCESS) {
          this._toastr.success(this._translate.instant('category.success-add-impact'));
          this.dialogRef.close();
        }
        else {
          this._toastr.warning(res.mess.description);
        }
      }, err => {
        this._toastr.error(this._translate.instant('common.500Error'));
      });
    }
  }
  onClosePopup() {
    if (this.formImpact.dirty && this.actTypeId) {
      const dialogData: ConfirmCloseDialog = {
        title: this.translateService.instant('common.confirm.close.title'),
        message: this.translateService.instant('common.confirm.close.content'),
        messageBold: this.translateService.instant('common.confirm.close.contentBold')
      };
      const confirm = this.dialog.originalOpen(ConfirmCloseDialogComponent, {
        maxWidth: '400px',
        data: dialogData,
      });
      confirm.afterClosed().subscribe(rs => {
        // tslint:disable-next-line: no-unused-expression
        rs ? this.dialogRef.close() : null;

      });
    } else {
      this.dialogRef.close();
    }
  }
}
