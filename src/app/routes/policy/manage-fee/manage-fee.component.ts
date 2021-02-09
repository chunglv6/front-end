import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';
import { ManageFeeService } from '@app/core/services/policy/manage-fee.service';
import { CommonCRMService, HTTP_CODE, STATUS_MANAGE_FEE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmBoldFormDialogModel, ConfirmDialogBoldFormComponent } from '@app/shared/components/confirm-dialog-bold-form/confirm-dialog-bold-form.component';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { ManageFeeAddEditComponent } from '../manage-fee-add-edit/manage-fee-add-edit.component';


@Component({
  selector: 'app-manage-fee',
  templateUrl: './manage-fee.component.html',
  styleUrls: ['./manage-fee.component.scss']
})
export class ManageFeeComponent extends BaseComponent implements OnInit {

  minEffectiveDate = new Date(Date.now());
  createDateFrom = null;
  createDateTo = null;
  approveDateFrom = null;
  approveDateTo = null;
  startDateFrom = null;
  endDateTo = null;
  startEffectDateForm = new FormControl();

  selection = new SelectionModel<any>(true, []);

  listActType = [];
  listActReason = [];

  status = STATUS_MANAGE_FEE;

  constructor(
    public actr: ActivatedRoute,
    private fb: FormBuilder,
    protected translateService: TranslateService,
    private _commonCrmService: CommonCRMService,
    private _manageFeeService: ManageFeeService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
  ) {
    super(actr, _manageFeeService, RESOURCE.POLICY, toastr, translateService, dialog);
    this.formSearch = this.fb.group({
      actionTypeId: [null],
      actTypeName: [''],
      actReasonId: [null],
      status: [''],
      startDate: [''],
      endDate: [''],
      createDate: [''],
      fee: [''],
      actReasonName: [''],
      effect: [''],
      noEffect: [''],
      serviceFeeCode: ['']
    });

  }
  ngOnInit() {
    this.columns = [
      { i18n: 'promotion.approve', field: 'checkbox' },
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'manage-fee.code', field: 'serviceFeeCode' },
      { i18n: 'action_audit.actionType', field: 'actTypeName' },
      { i18n: 'search-information.action-reason', field: 'actReasonName' },
      { i18n: 'manage-fee.fee', field: 'fee' },
      { i18n: 'promotion.startDateEffect', field: 'startDate' },
      { i18n: 'promotion.endDateEffect', field: 'endDate' },
      { i18n: 'common.status', field: 'isActive' },
      { i18n: 'promotion.createDate', field: 'createDate' },
      { i18n: 'common.action', field: 'action' },
    ];
    super.mapColumn();
    this.bindData();
  }

  bindData() {
    this.getListActType();
    this.getData();
  }

  handleSearchModelTrim() {
    if (this.formSearch.controls.effect.value)
      this.searchModel.isActive = true;
    if (this.formSearch.controls.noEffect.value)
      this.searchModel.isActive = false;
    if ((!this.formSearch.controls.noEffect.value && !this.formSearch.controls.effect.value)
      || (this.formSearch.controls.noEffect.value && this.formSearch.controls.effect.value)) {
      delete this.searchModel.isActive;
    }
    if (this.formSearch.get('actionTypeId').value)
      this.searchModel.actionTypeId = this.formSearch.get('actionTypeId').value;
    else
      delete this.searchModel.actionTypeId;
    if (this.formSearch.get('actReasonId').value)
      this.searchModel.actReasonId = this.formSearch.get('actReasonId').value;
    else
      delete this.searchModel.actReasonId;
    if (this.formSearch.get('fee').value)
      this.searchModel.fee = this.formSearch.get('fee').value;
    else
      delete this.searchModel.fee;
    if (this.formSearch.get('serviceFeeCode').value)
      this.searchModel.fee = this.formSearch.get('serviceFeeCode').value;
    else
      delete this.searchModel.serviceFeeCode;
    if (this.formSearch.get('status').value || this.formSearch.get('status').value === 0)
      this.searchModel.status = this.formSearch.get('status').value;
    else
      delete this.searchModel.status;
    this.searchModel.startDate = this.startDateFrom ? moment(this.startDateFrom).format(COMMOM_CONFIG.DATE_FORMAT).toString() : null;
    this.searchModel.endDate = this.endDateTo ? moment(this.endDateTo).format(COMMOM_CONFIG.DATE_FORMAT).toString() : null;
    if (!this.searchModel.startDate) {
      delete this.searchModel.startDate;
    }
    if (!this.searchModel.endDate) {
      delete this.searchModel.endDate;
    }
  }

  getData() {
    this.isLoading = true;
    this.handleSearchModelTrim();
    this._manageFeeService.searchManageFee(this.searchModel).subscribe(res => {
      if (res.mess.code == 1) {
        this.totalRecord = res.data.count;
        this.isLoading = false;
        this.dataModel.dataSource = res.data.listData;
      }
    });
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

  getListActReason(event) {
    this.formSearch.controls.actReasonId.setValue(null);
    const actTypeId = event ? event.id : null;
    if (!actTypeId) {
      this.listActReason = [];
      return;
    }
    this._commonCrmService.getReason(actTypeId).subscribe(res => {
      if (res.mess.code == 1) {
        this.listActReason = res.data.map(val => {
          return {
            id: val.id,
            name: val.name
          };
        });
      }
    });
  }
  editRecord(record?, view?) {
    let isView = false;
    if (view) {
      record.view = true;
      isView = true;
    }
    const dialogRef = this.dialog.open({
      width: '60%',
      panelClass: 'my-dialog',
      disableClose: true,
      autoFocus: !isView,
      data: { record }
    }, ManageFeeAddEditComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (record)
        this.onSearch();
      else
        this.getData();
    });

  }

  deleteRecord(item) {
    const message = this.translateService.instant('manage-fee.delete.confirm');
    const dialogData = new ConfirmBoldFormDialogModel(this.translateService.instant('common.button.confirm'), message, item.actReasonName, '?');
    const dialogRef = this.dialog.originalOpen(ConfirmDialogBoldFormComponent, {
      maxWidth: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this._manageFeeService.deleteManageFee(item.id).subscribe(res => {
          if (res) {
            this.toastr.success(this.translateService.instant('common.notify.delete.success'));
            this.getData();
          }
          else
            this.toastr.warning(this.translateService.instant('common.notify.fail'));
        });
      }
    });
  }

  approvalPromotion() {
    if (this.selection.selected.length === 0) {
      this.toastr.warning(this.translateService.instant('manage-fee.notify.empty.select.approve'));
      return;
    }
    const listName = this.selection.selected.map(x => x.actReasonName);
    const message = this.translateService.instant('manage-fee.approve.confirm');
    const dialogData = new ConfirmBoldFormDialogModel(this.translateService.instant('common.button.confirm'), message, listName.join('", "'), '?');
    const dialogRef = this.dialog.originalOpen(ConfirmDialogBoldFormComponent, {
      maxWidth: '400px',
      data: dialogData
    });

    const listId = this.selection.selected.map(x => x.id);


    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        const body = {
          listId: listId.join()
        };
        this._manageFeeService.approveManageFee(body).subscribe(res => {
          if (res.mess.code == HTTP_CODE.SUCCESS) {
            this.toastr.success(this.translateService.instant('common.notify.approve.success'));
            this.onSearch();
          }
          else
            this.toastr.error(res.mess.description);
        });
      }
    });
  }

  exportFile() {
    this.handleSearchModelTrim();
    this._manageFeeService.exportExcel(this.searchModel).subscribe(
      res => {
        const contentDisposition = res.headers.get('content-disposition');
        const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
        saveAs(res.body, filename);
      },
      err => {
        this.toastr.warning(this.translateService.instant('common.notify.fail'));
      }
    );
  }

  checkItem(item) {
    this.selection.toggle(item);
  }
}
