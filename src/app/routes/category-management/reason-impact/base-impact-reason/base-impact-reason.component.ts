import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core/app-config';
import { SelectOptionCategory } from '@app/core/models/common.model';
import { CategoryManagementService } from '@app/core/services/category/category-management.service';
import { ValidationService } from '@app/shared/common/validation.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmCloseDialogComponent } from '@app/shared/components/confirm-close-dialog/confirm-close-dialog.component';
import { HTTP_CODE, STATUS } from '@app/shared/constant/common.constant';
import { ConfirmCloseDialog } from '@app/shared/models/confirm-close-dialog';
import { CommonCRMService } from '@app/shared/services/common-crm.service';
import { MtxDialog } from '@ng-matero/extensions/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-base-impact-reason',
  templateUrl: './base-impact-reason.component.html',
  styleUrls: ['./base-impact-reason.component.scss']
})
export class BaseImpactReasonComponent extends BaseComponent implements OnInit {
  actReasonId: number;
  actTypeId: number;
  actTypeName: string;
  listActType: SelectOptionCategory[] = [] as SelectOptionCategory[];
  formImpact: FormGroup;
  listStatus = STATUS;
  header;
  constructor(
    public actr: ActivatedRoute,
    private _commonCrmService: CommonCRMService,
    protected _toastr: ToastrService,
    protected _translate: TranslateService,
    private fb: FormBuilder,
    public dialog?: MtxDialog,
    @Inject(MAT_DIALOG_DATA) public dataDialog?: any,
    public dialogRef?: MatDialogRef<TemplateRef<BaseImpactReasonComponent>>,
    private categoryManagementService?: CategoryManagementService,
  ) {
    super(actr, _commonCrmService, RESOURCE.CATEGORY, _toastr, _translate, dialog, dialogRef);

    this.formImpact = this.fb.group({
      actTypeName: ['', Validators.required],
      code: ['', [Validators.required, Validators.maxLength(255), ValidationService.cannotWhiteSpace]],
      name: ['', [Validators.required, Validators.maxLength(255), ValidationService.cannotWhiteSpace]],
      status: ['', Validators.required],
      description: ['', [Validators.maxLength(510), ValidationService.cannotWhiteSpace]]
    });
  }

  ngOnInit() {
    this.getListActType();
    if (this.dataDialog.data) {
      this.header = this._translate.instant('category.edit-impact-reason');
      this.actReasonId = this.dataDialog.data.actReasonId;
      this.getEditDataReason(this.actReasonId);
    } else {
      this.header = this._translate.instant('category.add-impact-reason');
    }
  }

  getListActType() {
    this._commonCrmService.getActionType().subscribe(res => {
      if (res.mess.code == 1) {
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

  getEditDataReason(actReasonId) {
    this.categoryManagementService.getDetailImpactReason(actReasonId).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.formImpact.controls.actTypeName.setValue(res.data.listData[0].actTypeId);
        this.formImpact.controls.code.setValue(res.data.listData[0].code);
        this.formImpact.controls.name.setValue(res.data.listData[0].name);
        this.formImpact.controls.status.setValue(res.data.listData[0].status);
        this.formImpact.controls.description.setValue(res.data.listData[0].description);
      }
    });
  }

  resetAllForm() {
    if (this.dataDialog.data) {
      this.actReasonId = this.dataDialog.data.actReasonId;
      this.getEditDataReason(this.actReasonId);
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
      description: this.formImpact.controls.description.value,
      actTypeName: String(this.formImpact.get('actTypeName').value),
      actTypeId: Number(this.formImpact.controls.actTypeName.value),
    };
    if (this.actReasonId) {
      this.categoryManagementService.editActReason(body, this.actReasonId).subscribe(res => {
        if (res.mess.code === HTTP_CODE.SUCCESS) {
          this._toastr.success(this._translate.instant('category.success-edit-impact-reason'));
          this.dialogRef.close();
        }
        else {
          this._toastr.warning(res.mess.description);
        }
      }, err => {
        this._toastr.error(this._translate.instant('common.500Error'));
      });
    } else {
      this.categoryManagementService.addActReason(body).subscribe(res => {
        if (res.mess.code === HTTP_CODE.SUCCESS) {
          this._toastr.success(this._translate.instant('category.success-add-impact-reason'));
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
    if (this.formImpact.dirty && this.actReasonId) {
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
