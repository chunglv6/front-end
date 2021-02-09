import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';
import { ManageFeeService } from '@app/core/services/policy/manage-fee.service';
import { CommonCRMService } from '@app/shared';
import { ValidationService } from '@app/shared/common/validation.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmCloseDialogComponent } from '@app/shared/components/confirm-close-dialog/confirm-close-dialog.component';
import { ConfirmCloseDialog } from '@app/shared/models/confirm-close-dialog';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-fee-add-edit',
  templateUrl: './manage-fee-add-edit.component.html',
  styleUrls: ['./manage-fee-add-edit.component.scss']
})
export class ManageFeeAddEditComponent extends BaseComponent implements OnInit {

  minEffectiveDate = new Date(Date.now());
  createDateFrom = null;
  createDateTo = null;
  approveDateFrom = null;
  approveDateTo = null;
  startDateFrom = null;
  endDateTo = null;
  startEffectDateForm = new FormControl();
  formSave: FormGroup;
  titlePopup: string;

  listActType = [];
  listActReason = [];
  viewMode = false;
  editMode = false;
  minDateStart = new Date();
  serviceNameType = '';

  constructor(public actr: ActivatedRoute,
    private fb: FormBuilder,
    protected translateService: TranslateService,
    private _commonCrmService: CommonCRMService,
    private _manageFeeService: ManageFeeService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
    public dialogRef?: MatDialogRef<TemplateRef<ManageFeeAddEditComponent>>,
    @Inject(MAT_DIALOG_DATA) public dataDialog?: any
  ) {
    super(actr, _manageFeeService, RESOURCE.POLICY, toastr, translateService, dialog, dialogRef);
    this.formSave = this.fb.group({
      actTypeId: [null, Validators.required],
      actReasonId: [null, Validators.required],
      fee: ['', [Validators.required, ValidationService.cannotWhiteSpace, Validators.max(999999999999999)]],
      description: ['', [Validators.maxLength(1024), ValidationService.cannotWhiteSpace]],
      startDate: ['', Validators.required],
      endDate: [''],
      docRefer: ['', [Validators.required, ValidationService.cannotWhiteSpace, Validators.maxLength(255)]],
      serviceFeeName: ['', [Validators.required, ValidationService.cannotWhiteSpace, Validators.maxLength(255)]],
      serviceFeeCode: ['', [Validators.required, ValidationService.cannotWhiteSpace, Validators.maxLength(20)]]
    });

  }

  ngOnInit() {
    this.minDateStart = this.addDate(this.minDateStart);
    if (this.dataDialog.data.record) {
      this.editMode = true;
      this.minDateStart = null;
      this.titlePopup = this.translateService.instant('manage-fee.title.edit');
      if (this.dataDialog.data.record.view) {
        this.formSave.disable();
        this.viewMode = true;
        this.titlePopup = this.translateService.instant('manage-fee.title.view');
      }
    }
    else {
      this.titlePopup = this.translateService.instant('manage-fee.title.add');
    }

    this.bindData();
  }

  addDate(date: Date): Date {
    date.setDate(date.getDate() + 1);
    return date;
  }


  bindData() {
    this.getListActType();
    this.getData();
  }

  getData() {
    if (this.dataDialog.data.record) {
      this._manageFeeService.findOne(this.dataDialog.data.record.id, '/service-charges').subscribe(res => {
        if (res.mess.code == 1) {
          this.dataModel = res.data;
          this.formSave.get('actTypeId').setValue(Number(res.data.actionTypeId));
          this.formSave.controls.serviceFeeCode.setValue(res.data.serviceFeeCode);
          this.formSave.controls.fee.setValue(res.data.fee);
          this.formSave.get('description').setValue(res.data.description);
          this.formSave.get('docRefer').setValue(res.data.docRefer);
          this.startDateFrom = moment(res.data.startDate, COMMOM_CONFIG.DATE_FORMAT).format();
          this.endDateTo = res.data.endDate ? moment(res.data.endDate, COMMOM_CONFIG.DATE_FORMAT).format() : null;
          // tslint:disable-next-line: no-shadowed-variable
          const event =  this.listActType.find(element => element.id == Number(res.data.actionTypeId));
          this.getListActReason(event);
          this.formSave.get('actReasonId').setValue(res.data.actReasonId);
          this.formSave.controls.serviceFeeName.setValue(res.data.serviceFeeName);
          if (!this.formSave.controls.description.value)
            this.formSave.controls.description.setValue('');
          if (!this.formSave.controls.docRefer.value)
            this.formSave.controls.description.setValue('');
        }
      });
    }
  }

  getListActType() {
    this._commonCrmService.getActionType().subscribe(res => {
      if (res.mess.code == 1) {
        this.listActType = res.data.map(val => {
          return {
            code: val.code,
            name: val.name,
            id: val.actTypeId
          };
        });
      }
    });
  }

  setServiceFeeName(event) {
    this.formSave.controls.serviceFeeName.setValue(this.serviceNameType + ' - ' + event.name);
  }

  getListActReason(event) {
    let actTypeId = event ? event.id : null;
    if (!actTypeId && event)
      actTypeId = event;
    if (!actTypeId) {
      this.listActReason = [];
      return;
    }
    this.formSave.controls.actReasonId.setValue(null);
    this._commonCrmService.getReason(actTypeId).subscribe(res => {
      if (res.mess.code == 1) {
        this.listActReason = res.data.map(val => {
          return {
            id: Number(val.id),
            name: val.name
          };
        });
        this.serviceNameType = event.name;
      }
    });
  }

  save(record?) {
    const startDateManageFee = this.formSave.controls.startDate.value ? moment(this.formSave.controls.startDate.value).format(COMMOM_CONFIG.DATE_FORMAT) : null;
    const endDateManageFee = this.formSave.controls.endDate.value ? moment(this.formSave.controls.endDate.value).format(COMMOM_CONFIG.DATE_FORMAT) : null;
    const body = {
      actionTypeId: this.formSave.controls.actTypeId.value,
      actReasonId: this.formSave.controls.actReasonId.value,
      fee: this.formSave.controls.fee.value,
      description: this.formSave.controls.description.value,
      startDate: startDateManageFee,
      endDate: endDateManageFee,
      docRefer: this.formSave.controls.docRefer.value,
      serviceFeeName: this.formSave.controls.serviceFeeName.value,
      serviceFeeCode: this.formSave.controls.serviceFeeCode.value,
    };
    let id;
    let noti: string;
    if (record) {
      id = record.id;
      noti = this.translateService.instant('common.notify.save.success');
    }
    else {
      id = null;
      noti = this.translateService.instant('common.notify.add.success');
    }
    this._manageFeeService.save(body, id).subscribe(res => {
      switch (res.mess.code) {
        case 1: {
          this.toastr.success(noti);
          super.onClosePopup();
          break;
        }
        default:
          this.toastr.error(res.mess.description);
      }
    });
  }

  minDate(): Date // BetweenCurrentDayAndEffday
  {
    if (!this.minDateStart && !this.startDateFrom) return null;
    if (!this.startDateFrom)
      return null;
    const currentDate = new Date();
    let currentDateMoment: any;
    currentDateMoment = moment(currentDate, COMMOM_CONFIG.DATE_FORMAT).format();
    if (currentDateMoment > this.startDateFrom) {
      return currentDateMoment;
    }
    else {
      return this.startDateFrom;
    }
  }

  typeAgain() {
    if (this.dataDialog.data.record) {
      this.formSave.get('actTypeId').setValue(Number(this.dataModel.actionTypeId));
      // tslint:disable-next-line: no-shadowed-variable
      const event =  this.listActType.find(element => element.id == Number(this.dataModel.actionTypeId))
      this.formSave.controls.serviceFeeCode.setValue(this.dataModel.serviceFeeCode);
      this.getListActReason(event);
      this.formSave.get('actReasonId').setValue(this.dataModel.actReasonId);
      this.formSave.controls.serviceFeeName.setValue(this.dataModel.serviceFeeName);
      this.formSave.controls.fee.setValue(this.dataModel.fee);
      this.formSave.get('description').setValue(this.dataModel.description);
      this.formSave.get('docRefer').setValue(this.dataModel.docRefer);
      this.startDateFrom = moment(this.dataModel.startDate, COMMOM_CONFIG.DATE_FORMAT).format();
      if (this.dataModel.endDate)
        this.endDateTo = moment(this.dataModel.endDate, COMMOM_CONFIG.DATE_FORMAT).format();
      else
        this.endDateTo = null;
      if (!this.formSave.controls.description.value)
        this.formSave.controls.description.setValue('');
      if (!this.formSave.controls.docRefer.value)
        this.formSave.controls.docRefer.setValue('');
    } else {
      this.formSave.controls.actTypeId.setValue(null);
      this.formSave.controls.actReasonId.reset();
      this.formSave.controls.fee.reset();
      this.formSave.controls.description.reset();
      this.formSave.controls.startDate.reset();
      this.formSave.controls.endDate.reset();
      this.formSave.controls.docRefer.reset();
      this.formSave.controls.serviceFeeName.reset();
      this.formSave.controls.serviceFeeCode.reset();
    }
  }
  onClosePopup() {
    if (this.formSave.dirty) {
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
