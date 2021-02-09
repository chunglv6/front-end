import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ContractService, CustomerService, RESOURCE, VehicleService } from '@app/core';
import { PromotionService } from '@app/core/services/policy/promotion.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { HTTP_CODE, TYPE_OBJECT } from '@app/shared/constant/common.constant';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { iif } from 'rxjs';
import { debounceTime, finalize, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-promotion-assign',
  templateUrl: './promotion-assign.component.html',
  styleUrls: ['./promotion-assign.component.scss']
})
export class PromotionAssignComponent extends BaseComponent implements OnInit {

  minEffectiveDate = new Date(Date.now());
  createDateFrom = null;
  createDateTo = null;
  approveDateFrom = null;
  approveDateTo = null;
  startDateFrom = null;
  endDateTo = null;
  formSave: FormGroup;
  titlePopup: string;
  titleDoc: string;
  isLoadingSearch = true;
  searchList = [];
  objectSelected = false;
  objectType = TYPE_OBJECT;

  maxDate: any;
  minDate: any;
  maxDateObj: any;
  minDateObj: any;

  _custId: any;
  _contractId: any;
  _vehicleId: any;
  _plateNumber: any;

  constructor(public actr: ActivatedRoute,
    private fb: FormBuilder,
    private _promotionService: PromotionService,
    private _contractInfoService: ContractService,
    private _vehicleService: VehicleService,
    private _customerService: CustomerService,
    protected translateService: TranslateService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
    public dialogRef?: MatDialogRef<TemplateRef<PromotionAssignComponent>>,
    @Inject(MAT_DIALOG_DATA) public dataDialog?: any) {
    super(actr, _promotionService, RESOURCE.POLICY, toastr, translateService, dialog, dialogRef);
    this.formSearch = this.fb.group({
      valueSearchCustomer: [''],
      valueSearchContract: [''],
      valueSearchVehicle: [''],
      assignLevel: ['', Validators.required],
      effDate: ['', Validators.required],
      expDate: ['']
    });
  }

  ngOnInit() {
    this.startDateFrom = moment(this.dataDialog.data.record.effDate, COMMOM_CONFIG.DATE_FORMAT).format();
    this.endDateTo = this.dataDialog.data.record.expDate ? moment(this.dataDialog.data.record.expDate, COMMOM_CONFIG.DATE_FORMAT).format() : null;
    this.maxDateObj = this.dataDialog.data.record.expDate ? moment(this.dataDialog.data.record.expDate, COMMOM_CONFIG.DATE_FORMAT) : null;
    this.maxDate = this.maxDateObj ? this.maxDateObj.toDate() : null;
    this.minDateObj = this.dataDialog.data.record.effDate ? moment(this.dataDialog.data.record.effDate, COMMOM_CONFIG.DATE_FORMAT) : null;
    this.minDate = this.minDateObj.toDate();
    this.formSearch.controls.assignLevel.setValue(TYPE_OBJECT.VEHICLE);
    this.onChangeAssignLevel(TYPE_OBJECT.VEHICLE);
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
      { i18n: 'common.action', field: 'action' },
    ];
    super.mapColumn();
    this.formSearch.get('valueSearchContract').valueChanges.pipe(debounceTime(1000),
      tap(() => {
        this.isLoadingSearch = true;
        this.searchList = [];
      }),
      switchMap((value) =>
        iif(() => typeof value !== 'object', this._contractInfoService.searchContractInfo(value))
          .pipe(finalize(() => this.isLoadingSearch = false))
      )).subscribe(rs => {
        if (rs.mess.code == HTTP_CODE.SUCCESS)
          this.searchList = rs.data.listData.map(val => {
            return {
              contractId: val.contractId,
              custId: val.custId,
              name: val.custName
            };
          });
      });
    this.formSearch.get('valueSearchCustomer').valueChanges.pipe(debounceTime(1000),
      tap(() => {
        this.isLoadingSearch = true;
        this.searchList = [];
      }),
      switchMap((value) =>
        iif(() => typeof value !== 'object', this._customerService.searchCustomerInfo(value))
          .pipe(finalize(() => this.isLoadingSearch = false))
      )).subscribe(rs => {
        if (rs.mess.code == HTTP_CODE.SUCCESS)
          this.searchList = rs.data.listData.map(val => {
            return {
              custId: val.custId,
              name: val.custName
            };
          });
      });
    this.formSearch.get('valueSearchVehicle').valueChanges.pipe(debounceTime(1000),
      tap(() => {
        this.isLoadingSearch = true;
        this.searchList = [];
      }),
      switchMap((value) =>
        iif(() => typeof value !== 'object', this._customerService.searchCustomerByPlateNumber(value))
          .pipe(finalize(() => this.isLoadingSearch = false))
      )).subscribe(rs => {
        if (rs.mess.code == HTTP_CODE.SUCCESS)
            this.searchList = rs.data.listData.map(val => {
              return {
                custId: val.custId,
                name: val.custName,
                contractId: val.contracts[0].contractId,
                vehicleId: val.contracts[0].plateNumbers[0].vehicleId,
                plateNumber: val.contracts[0].plateNumbers[0].plateNumber
              };
            });
      });
    this.getDataTable();
  }

  onChangeAssignLevel(value) {
    if (value == TYPE_OBJECT.CONTRACT) {
      this.formSearch.controls.valueSearchContract.setValidators(Validators.required);
      this.formSearch.controls.valueSearchCustomer.clearValidators();
      this.formSearch.controls.valueSearchVehicle.clearValidators();
    }
    if (value == TYPE_OBJECT.CUSTOMER) {
      this.formSearch.controls.valueSearchCustomer.setValidators(Validators.required);
      this.formSearch.controls.valueSearchContract.clearValidators();
      this.formSearch.controls.valueSearchVehicle.clearValidators();
    }
    if (value == TYPE_OBJECT.VEHICLE) {
      this.formSearch.controls.valueSearchVehicle.setValidators(Validators.required);
      this.formSearch.controls.valueSearchCustomer.clearValidators();
      this.formSearch.controls.valueSearchContract.clearValidators();
    }
    this.formSearch.controls.valueSearchVehicle.updateValueAndValidity();
    this.formSearch.controls.valueSearchCustomer.updateValueAndValidity();
    this.formSearch.controls.valueSearchContract.updateValueAndValidity();
  }

  getDataTable(isViewPage?) {
    if (!isViewPage) {
      this.searchModel.startrecord = 0;
      this.pageIndex = 0;
    }
    this._promotionService.searchPromotionAssign(this.dataDialog.data.record.id).subscribe(res => {
      if (res.mess.code == 1) {
        this.dataModel.dataSource = res.data.listData.map(val => {
          this.totalRecord = res.data.count;
          return {
            id: this.dataDialog.data.record.id,
            custId: val.custId,
            contractId: val.contractId,
            custName: val.custName,
            contractNo: val.contractNo,
            plateNumber: val.plateNumber,
            promotionAssignId: val.promotionAssignId,
            promotionAmount: this.dataDialog.data.record.promotionAmount,
            effDate: val.effDate,
            expDate: val.expDate,
            createUser: val.createUser,
            createDate: val.createDate
          };
        });
      }
    });
  }

  onSelectedOption(params) {
    this.objectSelected = true;
    this._custId = params.custId;
    this._contractId = params.contractId;
    this._vehicleId = params.vehicleId;
    this._plateNumber = params.plateNumber;
  }

  displayFn(item) {
    if (item)
      return item.name;
  }

  assignObject() {
    if (!this.objectSelected) {
      // bao loi
      this.toastr.error(this.translateService.instant('promotion.assign.notify.fail'));
      return;
    }

    const startDate = this.formSearch.controls.effDate.value ? moment(this.formSearch.controls.effDate.value).format(COMMOM_CONFIG.DATE_FORMAT) : null;
    const endDate = this.formSearch.controls.expDate.value ? moment(this.formSearch.controls.expDate.value).format(COMMOM_CONFIG.DATE_FORMAT) : null;

    const body = {
      assignLevel: this.formSearch.controls.assignLevel.value,
      contractId: this._contractId,
      custId: this._custId,
      promotionId: this.dataDialog.data.record.id,
      vehicleId: this._vehicleId,
      effDate: startDate,
      expDate: endDate,
      plateNumber: this._plateNumber
    };
    if (this.formSearch.controls.assignLevel.value == this.objectType.CUSTOMER) {
      if (body.contractId)
        delete body.contractId;
      if (body.vehicleId)
        delete body.vehicleId;
      if (body.plateNumber)
        delete body.plateNumber;
    }
    if (this.formSearch.controls.assignLevel.value == this.objectType.CONTRACT) {
      if (body.vehicleId)
        delete body.vehicleId;
      if (body.plateNumber)
        delete body.plateNumber;
    }
    this._promotionService.assignPromotionObject(body).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        this.objectSelected = false;
        this.formSearch.controls.valueSearchCustomer.setValue(null);
        this.formSearch.controls.valueSearchContract.setValue(null);
        this.formSearch.controls.valueSearchVehicle.setValue(null);
        this.toastr.success(this.translateService.instant('promotion.notify.assign.success'));
        this.getDataTable();
      }
      else
        this.toastr.error(this.translateService.instant(res.mess.description));
    });
  }

  deleteRecord(item) {
    const message = this.translateService.instant('promotion.confirm.delete.object');
    const dialogData = new ConfirmDialogModel(this.translateService.instant('common.button.confirm'), message);
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this._promotionService.deletePromotionAssign(item.promotionAssignId).subscribe(res => {
          if (res) {
            this.toastr.success(this.translateService.instant('common.notify.save.success'));
            this.getDataTable();
          }
          else
            this.toastr.warning(this.translateService.instant('common.notify.fail'));
        });
      }
    });
  }

  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.searchModel.startrecord = event.pageIndex == 0 ? event.pageIndex : ((event.pageIndex * event.pageSize));
    this.searchModel.pagesize = event.pageSize;
    this.getDataTable(true);
  }
}
