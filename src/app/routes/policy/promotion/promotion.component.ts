import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';
import { PromotionService } from '@app/core/services/policy/promotion.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmBoldFormDialogModel, ConfirmDialogBoldFormComponent } from '@app/shared/components/confirm-dialog-bold-form/confirm-dialog-bold-form.component';
import { HTTP_CODE, STATUS_MANAGE_FEE, TYPE_PROMOTION } from '@app/shared/constant/common.constant';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { PromotionAssignComponent } from '../promotion-assign/promotion-assign.component';


@Component({
  selector: 'app-promotion',
  templateUrl: './promotion.component.html',
  styleUrls: ['./promotion.component.css']
})
export class PromotionComponent extends BaseComponent implements OnInit {

  minEffectiveDate = new Date(Date.now());
  createDateFrom = null;
  createDateTo = null;
  approveDateFrom = null;
  approveDateTo = null;
  startDateFrom = null;
  endDateTo = null;
  startEffectDateForm = new FormControl();
  status = STATUS_MANAGE_FEE;
  typePromotion = TYPE_PROMOTION;
  selection = new SelectionModel<any>(true, []);

  constructor(
    public actr: ActivatedRoute,
    private fb: FormBuilder,
    private _promotionService: PromotionService,
    protected translateService: TranslateService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
  ) {
    super(actr, _promotionService, RESOURCE.POLICY, toastr, translateService, dialog);
    this.formSearch = this.fb.group({
      promotionLevel: [''],
      promotionCode: [''],
      promotionName: [''],
      status: [''],
      effDate: [''],
      expDate: [''],
      effect: [''],
      noEffect: ['']
    });

  }
  ngOnInit() {
    this.columns = [
      { i18n: 'promotion.approve', field: 'checkbox' },
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'promotion.typeProgram', field: 'promotionLevel' },
      { i18n: 'promotion.codeProgram', field: 'promotionCode' },
      { i18n: 'promotion.nameProgram', field: 'promotionName' },
      { i18n: 'promotion.level', field: 'promotionAmount' },
      { i18n: 'promotion.startDateEffect', field: 'effDate' },
      { i18n: 'promotion.endDateEffect', field: 'expDate' },
      { i18n: 'common.status', field: 'isActive' },
      { i18n: 'promotion.createDate', field: 'createDate' },
      { i18n: 'common.action', field: 'action' },
    ];
    super.mapColumn();
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
    if (this.formSearch.get('promotionLevel').value)
      this.searchModel.promotionLevel = this.formSearch.get('promotionLevel').value;
    else
      delete this.searchModel.promotionLevel;
    if (this.formSearch.get('promotionCode').value)
      this.searchModel.promotionCode = this.formSearch.get('promotionCode').value;
    else
      delete this.searchModel.promotionCode;
    if (this.formSearch.get('promotionName').value)
      this.searchModel.promotionName = this.formSearch.get('promotionName').value;
    else
      delete this.searchModel.promotionName;
    if (this.formSearch.get('status').value || this.formSearch.get('status').value === 0)
      this.searchModel.status = this.formSearch.get('status').value;
    else
      delete this.searchModel.status;
    this.searchModel.effDate = this.startDateFrom ? moment(this.startDateFrom).format(COMMOM_CONFIG.DATE_FORMAT).toString() : null;
    this.searchModel.endDate = this.endDateTo ? moment(this.endDateTo).format(COMMOM_CONFIG.DATE_FORMAT).toString() : null;
    if (!this.searchModel.effDate) {
      delete this.searchModel.effDate;
    }
    if (!this.searchModel.endDate) {
      delete this.searchModel.endDate;
    }
  }

  getData() {
    if (this.formSearch.valid) {
      this.selection.clear();
      this.dataModel.isAllSelected = false;
      this.isLoading = true;
      this.handleSearchModelTrim();
      this._promotionService.searchPromotion(this.searchModel).toPromise().then(res => {
        if (res.mess.code === HTTP_CODE.SUCCESS) {
          this.totalRecord = res.data.count;
          this.isLoading = false;
          this.dataModel.dataSource = res.data.listData;
        }
      });
    }
  }
  deleteRecord(item) {
    const message = this.translateService.instant('promotion.delete.button.confirm');
    const dialogData = new ConfirmBoldFormDialogModel(
      this.translateService.instant('common.button.confirm'), message, item.promotionName, '?',
      this.translateService.instant('common.button.delete')
    );
    const dialogRef = this.dialog.originalOpen(ConfirmDialogBoldFormComponent, {
      maxWidth: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this._promotionService.deletePromotion(item.id).subscribe(res => {
          if (res.mess.code == HTTP_CODE.SUCCESS) {
            this.toastr.success(this.translateService.instant('common.notify.save.success'));
            this.onSearch();
          }
          else
            this.toastr.warning(this.translateService.instant('common.notify.fail'));
        });
      }
    });
  }

  assignRecord(record) {
    const dialogRef = this.dialog.open({
      width: '60%',
      panelClass: 'my-dialog',
      disableClose: true,
      data: { record }
    }, PromotionAssignComponent);
    dialogRef.afterClosed().subscribe(result => {
      this.getData();
    });
  }

  approvePromotion() {
    if (this.selection.selected.length === 0) {
      this.toastr.warning(this.translateService.instant('manage-fee.notify.empty.select.approve'));
      return;
    }
    const listName = this.selection.selected.map(x => x.promotionName);
    const message = this.translateService.instant('promotion.approve.confirm');
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
        this._promotionService.approvePromotion(body).subscribe(res => {
          if (res.mess.code == HTTP_CODE.SUCCESS) {
            this.toastr.success(this.translateService.instant('common.notify.save.success'));
            this.getData();
          }
          else
            this.toastr.error(res.mess.description);
        });
      }
    });
  }

  exportFile() {
    this.handleSearchModelTrim();
    this._promotionService.exportExcel(this.searchModel).subscribe(
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
