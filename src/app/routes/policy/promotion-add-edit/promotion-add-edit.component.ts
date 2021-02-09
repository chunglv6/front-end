import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { RESOURCE } from '@app/core';
import { CanComponentDeactivate } from '@app/core/guards/can-dead-active';
import { PromotionService } from '@app/core/services/policy/promotion.service';
import { SharedDirectoryService } from '@app/shared';
import { ValidationService } from '@app/shared/common/validation.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmCloseDialogComponent } from '@app/shared/components/confirm-close-dialog/confirm-close-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { CrmTableComponent } from '@app/shared/components/table-component/table-component.component';
import { HTTP_CODE, METHOD_PROMOTION, TYPE_PROMOTION } from '@app/shared/constant/common.constant';
import { ConfirmCloseDialog } from '@app/shared/models/confirm-close-dialog';
import { COMMOM_CONFIG } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
@Component({
  selector: 'app-promotion-add-edit',
  templateUrl: './promotion-add-edit.component.html',
  styleUrls: ['./promotion-add-edit.component.scss']
})
export class PromotionAddEditComponent extends BaseComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  nav = [];
  minEffectiveDate = new Date(Date.now());
  createDateFrom = null;
  createDateTo = null;
  approveDateFrom = null;
  approveDateTo = null;
  startDateFrom = null;
  endDateTo = null;
  formSave: FormGroup;
  titlePopup: string;
  typePromotion = TYPE_PROMOTION;
  methodPromotion = METHOD_PROMOTION;

  viewMode = false;
  editMode = false;

  @ViewChild('fileTable') fileTable: CrmTableComponent;
  nextDay = new Date(Date.now() + 60 * 60 * 24 * 1000);
  dataSource: {};
  fileSource = [] as any;
  stageStationList = [];
  listFile = [] as any;
  indexFile = 0;
  deletedFile = [];
  except = false;
  columnsFile: any[] = [];
  displayedColumnsFile = [];
  totalRecordFile = 0;
  times = 0;
  routeSub: Subscription;
  constructor(public actr: ActivatedRoute,
    private fb: FormBuilder,
    private _promotionService: PromotionService,
    private _shareService: SharedDirectoryService,
    protected translateService: TranslateService,
    protected toastr: ToastrService,
    private _dialog: MatDialog,
    private _router: Router,
  ) {
    super(actr, _promotionService, RESOURCE.POLICY, toastr, translateService);
    this.formSave = this.fb.group({
      promotionLevel: ['', Validators.required],
      promotionCode: ['', [Validators.required, Validators.maxLength(20), ValidationService.cannotWhiteSpace]],
      promotionName: ['', [Validators.required, Validators.maxLength(255), ValidationService.cannotWhiteSpace]],
      promotionAmount: ['', [Validators.required, Validators.max(999999999999999), ValidationService.cannotWhiteSpace]],
      promotionType: ['', Validators.required],
      promotionContent: ['', [Validators.maxLength(40000), ValidationService.cannotWhiteSpace]],
      effDate: ['', Validators.required],
      expDate: [''],
      description: ['', [Validators.maxLength(1024), ValidationService.cannotWhiteSpace]],
      file: [''],
      buttonFile: [''],
      stageStationId: ['']
    });
  }
  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    if (this.formSave.dirty) {
      const dialogData: ConfirmCloseDialog = {
        title: this.translateService.instant('common.confirm.back.title'),
        message: this.translateService.instant('common.confirm.back.content'),
        messageBold: this.translateService.instant('common.confirm.back.contentBold')
      };
      const confirm = this._dialog.open(ConfirmCloseDialogComponent, {
        maxWidth: '400px',
        data: dialogData,
      });
      return confirm.afterClosed().toPromise();
    } else {
      return true;
    }

  }
  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

  ngOnInit() {

    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer.name', field: 'custName' },
      { i18n: 'contract.code', field: 'contractNo' },
      { i18n: 'briefcase.license_plates', field: 'plateNumber' },
      { i18n: 'promotion.level', field: 'promotionAmount' },
      { i18n: 'promotion.startDateEffect', field: 'effDate' },
      { i18n: 'promotion.endDateEffect', field: 'expDate' },
      { i18n: 'promotion.createDate', field: 'createDate' },
      { i18n: 'promotion.createUser', field: 'createUser' },
    ];
    this.columnsFile = [
      { i18n: 'pricelist-add.file-attach', field: 'documentName' },
      { i18n: 'common.action', field: 'actions' },
    ];
    this.displayedColumnsFile = this.columnsFile.map(x => x.field);
    super.mapColumn();
    this.nav = ['menu.dashboard', 'menu.policy', 'menu.policy.promotion', 'promotion.add.title'];
    this.routeSub = this.actr.params.subscribe(rs => {
      this.dataModel.id = rs['id'];

      this.viewMode = rs['view'] == 1;
      this.editMode = !this.viewMode;
      this.initData();
    });
  }

  async initData() {
    await this.getStageStationList();
    if (isNaN(this.dataModel.id)) {
      this.bindData();
    } else {
      await this.getDetail();
    }
  }
  async getDetail() {
    const rs = (await this._promotionService.findOne(this.dataModel.id, '/promotions').toPromise());
    if (rs.mess.code === HTTP_CODE.SUCCESS) {
      this.nextDay = null;
      this.nav = ['menu.dashboard', 'menu.policy', 'menu.policy.promotion', 'promotion.edit.title'];
      this.titlePopup = this.translateService.instant('promotion.edit.title');
      this.dataModel = rs.data;
      this.dataModel.id = rs.data.promotionId;
      this.dataModel.promotionId = rs.data.promotionId;
      this.except = this.dataModel.promotionLevel == TYPE_PROMOTION.MIENGIAM;
      this.totalRecordFile = rs.data.fileList.length;
      this.fileSource = rs.data.fileList;
      this.formSave.get('promotionLevel').setValue(Number(rs.data.promotionLevel));
      this.formSave.get('promotionCode').setValue(rs.data.promotionCode);
      this.formSave.controls.promotionName.setValue(rs.data.promotionName);
      this.formSave.controls.promotionAmount.setValue(rs.data.promotionAmount);
      this.formSave.get('promotionType').setValue(Number(rs.data.promotionType));
      this.formSave.get('description').setValue(rs.data.description);
      this.startDateFrom = moment(rs.data.effDate, COMMOM_CONFIG.DATE_FORMAT).format();
      this.endDateTo = rs.data.expDate ? moment(rs.data.expDate, COMMOM_CONFIG.DATE_FORMAT).format() : null;
      this.formSave.get('promotionContent').setValue(rs.data.promotionContent);
      if (rs.data.stationId || rs.data.stageId) {
        const idStationOrStage = rs.data.stageId ? rs.data.stageId : rs.data.stationId;
        this.stageStationList.forEach(element => {
          if (element.id == idStationOrStage)
            if ((element.isStage && rs.data.stageId) || (!element.isStage && rs.data.stationId)) {
              this.formSave.controls.stageStationId.setValue(element.no);
              this.dataModel.stageStationId = element.no;
            }
        });
      }
      if (!rs.data.description)
        this.formSave.controls.description.setValue('');
      if (!rs.data.promotionContent)
        this.formSave.controls.promotionContent.setValue('');
    } else {
      this.bindData();
    }
    if (this.viewMode) {
      this.formSave.disable();
      this.getDataTable();
    }
  }

  onChangeProgram(value) {
    if (value == TYPE_PROMOTION.MIENGIAM) {
      this.formSave.controls.stageStationId.setValidators(Validators.required);
      this.formSave.controls.stageStationId.updateValueAndValidity();
    }
    else {
      this.formSave.controls.stageStationId.clearValidators();
      this.formSave.controls.stageStationId.updateValueAndValidity();
    }
  }

  downLoadFile(item) {
    this._promotionService.downloadFile(item.attachmentFileId).subscribe(
      res => {
        saveAs(res.body, item.documentName);
      },
      err => {
        this.toastr.warning(this.translateService.instant('common.notify.fail'));
      }
    );
  }

  deleteFile(item, i) {
    if (this.viewMode)
      return;
    const message = this.translateService.instant('promotion.delete.file');
    const dialogData = new ConfirmDialogModel(this.translateService.instant('common.button.confirm'), message);
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        if (item.attachmentFileId) {
          this._promotionService.deleteFile(item.attachmentFileId).subscribe(res => {
            if (res.mess.code == HTTP_CODE.SUCCESS) {
              this.fileSource.splice(i, 1);
              this.totalRecordFile--;
              this.fileTable.renderTable();
              this.toastr.success(this.translateService.instant('common.notify.save.success'));
            }
            else
              this.toastr.warning(this.translateService.instant('common.notify.fail'));
          });
        }
        else {
          this.fileSource.splice(i, 1);
          this.deletedFile.push(item.id);
          this.totalRecordFile--;
          this.fileTable.renderTable();
        }
      }
    });
  }

  async getStageStationList() {
    let no = 1;
    const res = (await this._shareService.getListStageAndStation().toPromise());
    if (res.mess.code === HTTP_CODE.SUCCESS) {
      this.stageStationList = res.data.listData.map(val => {
        return {
          no: no++,
          id: val.stageId ? val.stageId : val.stationId,
          name: val.name,
          isStage: val.stageId ? true : false
        };
      });
    }
  }

  getDataTable() {
    this.isLoading = true;
    this._promotionService.searchPromotionAssign(this.dataModel.id).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        this.dataSource = res.data.listData;
        this.totalRecord = res.data.count;
        this.isLoading = false;
      }
    });
  }
  /**
   * Thêm mới
   */
  bindData() {
    this.titlePopup = this.translateService.instant('promotion.add.title');
    this.formSave.reset();
    this.formSave.get('promotionType').setValue(1);

  }

  save() {
    const dataForm = new FormData();
    let index = 0;
    let deleted = false;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.listFile.length; i++)
      // tslint:disable-next-line: prefer-for-of
      for (let j = 0; j < this.listFile[i].length; j++) {
        deleted = false;
        this.deletedFile.forEach(val => {
          if (val == index)
            deleted = true;
        });
        if (!deleted)
          dataForm.append('files', this.listFile[i][j]);
        index++;
      }

    const startDate = this.formSave.controls.effDate.value ? moment(this.formSave.controls.effDate.value).format(COMMOM_CONFIG.DATE_FORMAT) : null;
    const endDate = this.formSave.controls.expDate.value ? moment(this.formSave.controls.expDate.value).format(COMMOM_CONFIG.DATE_FORMAT) : null;
    const body = {
      promotionLevel: this.formSave.controls.promotionLevel.value,
      promotionCode: this.formSave.controls.promotionCode.value,
      promotionName: this.formSave.controls.promotionName.value,
      promotionAmount: this.formSave.controls.promotionAmount.value,
      promotionType: this.formSave.controls.promotionType.value,
      description: this.formSave.controls.description.value,
      promotionContent: this.formSave.controls.promotionContent.value,
      effDate: startDate,
      expDate: endDate,
      stageId: null,
      stationId: null
    };
    if (this.formSave.controls.promotionLevel.value == TYPE_PROMOTION.MIENGIAM) {
      if (this.stageStationList[this.formSave.controls.stageStationId.value].isStage) {
        body.stageId = this.stageStationList[this.formSave.controls.stageStationId.value -1].id;
        delete body.stationId;
      }
      else {
        body.stationId = this.stageStationList[this.formSave.controls.stageStationId.value -1].id;
        delete body.stageId;
      }
    }
    else {
      delete body.stationId;
      delete body.stageId;
    }
    let id;
    let noti: string;
    if (this.dataModel.id && this.dataModel.id != -1) {
      id = this.dataModel.id;
      noti = this.translateService.instant('common.notify.save.success');
    }
    else {
      id = null;
      noti = this.translateService.instant('common.notify.add.success');
    }

    dataForm.append('dataParams', new Blob([JSON.stringify(body)],
      {
        type: 'application/json'
      }));
    this._promotionService.save(dataForm, id).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.formSave.markAsPristine();
        this.toastr.success(noti);
        this._router.navigate(['policy', 'promotion']);
      }
      else
        this.toastr.error(res.mess.description);
    });
  }

  onFileChange(files) {
    this.listFile.push(files.target.files);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.listFile[this.times].length; i++) {
      this.fileSource.push({
        attachmentFileId: null,
        documentName: this.listFile[this.times][i].name,
        id: this.indexFile++
      });
    }
    this.totalRecordFile += this.listFile[this.times].length;
    this.fileTable.renderTable();
    this.times++;
  }

  typeAgain() {
    this.formSave.markAsPristine();
    if (this.dataModel.promotionId) {
      if (this.dataModel.stageStationId)
        this.formSave.controls.stageStationId.setValue(this.dataModel.stageStationId);
      this.formSave.get('promotionLevel').setValue(Number(this.dataModel.promotionLevel));
      this.formSave.get('promotionCode').setValue(this.dataModel.promotionCode);
      this.formSave.controls.promotionName.setValue(this.dataModel.promotionName);
      this.formSave.get('promotionAmount').setValue(this.dataModel.promotionAmount);
      this.formSave.get('promotionType').setValue(Number(this.dataModel.promotionType));
      this.formSave.get('description').setValue(this.dataModel.description);
      this.startDateFrom = moment(this.dataModel.effDate, COMMOM_CONFIG.DATE_FORMAT).format();
      this.endDateTo = this.dataModel.expDate ? moment(this.dataModel.expDate, COMMOM_CONFIG.DATE_FORMAT).format() : null;
      this.formSave.get('promotionContent').setValue(this.dataModel.promotionContent);
      if (!this.dataModel.description)
        this.formSave.controls.description.setValue('');
      if (!this.dataModel.promotionContent)
        this.formSave.controls.promotionContent.setValue('');
    } else {
      this.formSave.get('promotionType').setValue(1);
      this.formSave.controls.promotionLevel.setValue(null);
      this.formSave.controls.promotionCode.reset();
      this.formSave.controls.promotionAmount.reset();
      this.formSave.controls.promotionName.reset();
      this.formSave.controls.description.reset();
      this.formSave.controls.promotionContent.reset();
      this.formSave.controls.effDate.reset();
      this.formSave.controls.expDate.reset();
      this.formSave.controls.stageStationId.reset();
    }
  }
  onClosePopup() {
    if (this.formSave.dirty) {
      const dialogData: ConfirmCloseDialog = {
        title: this.translateService.instant('common.confirm.title.delete'),
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
