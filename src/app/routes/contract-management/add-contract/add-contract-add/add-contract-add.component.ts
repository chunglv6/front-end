// author hieulx
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NumberValueAccessor, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService } from '@app/core';
import { RESOURCE } from '@app/core/app-config';
import { SelectOptionModel } from '@app/core/models/common.model';
import { InforRegisterVehicleModel } from '@app/core/models/customer-register.model';
import { AppStorage } from '@app/core/services/AppStorage';
import { CustomerService } from '@app/core/services/customer/customer.service';
import { RouteStore } from '@app/routes/routes.store';
import { ValidationService } from '@app/shared/common/validation.service';
import { AttachFileComponent } from '@app/shared/components/attach-file/attach-file.component';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { ViewFileImageComponent } from '@app/shared/components/view-file-image/view-file-image.component';
import { ViewFilePdfComponent } from '@app/shared/components/view-file-pdf/view-file-pdf.component';
import { ACTION_TYPE, CUSTOMER_TYPE, CUSTOMER_TYPE_ID, gender, HTTP_CODE } from '@app/shared/constant/common.constant';
import { CommonCRMService } from '@app/shared/services/common-crm.service';
import { SharedDirectoryService } from '@app/shared/services/shared-directory.service';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxGridColumn } from '@ng-matero/extensions';
import { MtxDialog } from '@ng-matero/extensions/dialog';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { iif, Observable } from 'rxjs';
import { debounceTime, finalize, switchMap, tap } from 'rxjs/operators';
@Component({
  selector: 'add-contract-add',
  templateUrl: './add-contract-add.component.html',
  styleUrls: ['./add-contract-add.component.scss'],
  providers: [NumberValueAccessor]
})
export class AddContractAddComponent extends BaseComponent implements OnInit {

  constructor(
    private routeStore: RouteStore,
    private _sharedDirectoryService: SharedDirectoryService, // API lấy city/district/ward
    private _commonCRMService: CommonCRMService,
    protected translateService: TranslateService,
    public actr: ActivatedRoute,
    public dialog: MtxDialog,
    private fb: FormBuilder,
    private _customerInfoService: CustomerService,
    private _contractService: ContractService,
    protected toastr?: ToastrService,
    private _router?: Router,

  ) {
    super(actr, _customerInfoService, RESOURCE.CONTRACT, toastr);

    this.formInformation = this.fb.group({
      searchContract: ['', Validators.required],
    });

    this.formSearch = this.fb.group({
      noticeName: ['', [Validators.required, Validators.maxLength(510), ValidationService.cannotWhiteSpace]],
      city: ['', Validators.required],
      district: ['', Validators.required],
      ward: ['', Validators.required],
      noticeAreaCode: ['', [Validators.required, Validators.maxLength(255), ValidationService.cannotWhiteSpace]],
      noticeAreaName: ['', [Validators.required, Validators.maxLength(510), ValidationService.cannotWhiteSpace]],
      noticePhoneNumber: ['', [Validators.required, Validators.pattern(COMMOM_CONFIG.NUMBER_PHONE_FORMAT)]],
      noticeEmail: ['', [Validators.pattern(COMMOM_CONFIG.EMAIL_FORMAT), ValidationService.cannotWhiteSpace]],
      contractNo: [''],
      signDate: [new Date(Date.now()), Validators.required],
      accountUser: ['', Validators.required],
      effDate: [new Date(Date.now()), [Validators.required]],
      expDate: [''],
      signName: [''],
      gender: [''],
      goicuoc: [''],
      chuky: [''],
      thongbao: [''],
      receiveEmail: [''],
      receiveNotify: [''],
      receiveSMS: [''],
      extendSMS: [''],
      license: [''],
    });
  }
  maxSignDay = null;
  expDate = null;
  signDate = new Date(Date.now());
  effDate = new Date(Date.now());

  @Input() contractId: number;
  @Input() customerId: number;

  formSearch: FormGroup;
  // ghép API city/district/ward
  isDisableDistrict = true;
  isDisableWard = true;
  listOptionCity: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionDistrict: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionWard: SelectOptionModel[] = [] as SelectOptionModel[];

  // ghép API loại giấy tờ
  listDocumentType: SelectOptionModel[] = [] as SelectOptionModel[];
  filteredOptions: Observable<string[]>;
  listCustomer = [];
  selectedCustomer: any = {};
  states = [];
  value: string;
  selectedDocument: number;
  checkValidForm = true;
  listOptionLicense: SelectOptionModel[] = [] as SelectOptionModel[];

  noticeAreaName = ['', '', '', ''];

  CUSTOMER_TYPE = CUSTOMER_TYPE;
  CUSTOMER_TYPE_ID = CUSTOMER_TYPE_ID;
  customerTypeId = 1;

  listDataProfile = [];
  displayedColumns_profile = ['stt', 'documentType', 'documentName', 'actionDelete'];
  dataSourceProfile = new MatTableDataSource<any>(this.listDataProfile);
  columns_profile: MtxGridColumn[];
  @ViewChild('tableProfile') tableProfile: MatTable<any>;
  @ViewChild(MatPaginator, { static: true }) paginatorProfile: MatPaginator;
  indexPaginator = 0;
  pageSizeList = [10, 20, 50, 100];

  birthDayDate: string;
  dateOfIssue: string;
  isLoadingAuto: boolean;
  formInformation: FormGroup;

  formatDate = COMMOM_CONFIG.DATE_FORMAT;
  fromDateSign = new FormControl();
  fromDateEff = new FormControl();
  fromDateExp = new FormControl();
  filteredStates = this.states;
  firstLoad = true;

  //#region  BindDetaiBase
  ngOnInit() {
    this.getListOptionCity();
    this.changeValueCity();
    this.changeValueDistrict();
    this.changeValueWard();
    this.changeValueStreet();
    this.getListDocumentTypeObject();
    this.changeValueForm();
    super.mapColumn();
    this.dataModel.accountUser = AppStorage.getUserLogin();
    this.dataModel.payCharge = '1';
    this.dataModel.billCycle = '1';
    this.selectedCustomer.custTypeId = CUSTOMER_TYPE_ID.CA_NHAN_TRONG_NUOC;
    this.formInformation
      .get('searchContract')
      .valueChanges.pipe(
        debounceTime(1000),
        tap(() => {
          this.isLoadingAuto = true;
          this.filteredStates = [];
        }),
        switchMap(value =>
          iif(
            () => typeof value !== 'object',
            this._customerInfoService.searchCustomerInfo(value.trim()),
            null
          ).pipe(finalize(() => (this.isLoadingAuto = false)))
        )
      )
      .subscribe(rs => {
        this.filteredStates = rs.data.listData;
      });
  }

  inItColumns() {
    this.translateService.get('customer-management.updateProfileTable').subscribe(res => {
      this.columns_profile = [
        { i18n: res.stt, field: 'stt', disabled: true },
        { i18n: res.documentType, field: 'documentType', disabled: true },
        { i18n: res.documentName, field: 'documentName', disabled: true },
        { i18n: res.actionDelete, field: 'actionDelete', disabled: true }
      ];
    });
  }

  renderTable() {
    this.dataSourceProfile.paginator = this.paginatorProfile;
    this.tableProfile.renderRows();
  }

  onPaginateChange(event) {
    this.indexPaginator = event.pageIndex * event.pageSize;
  }

  deleteProfile(index) {
    this.confirmDialogDeleteProfile(index);
  }

  confirmDialogDeleteProfile(i) {
    this.listDataProfile.splice(i + this.indexPaginator, 1);
    this.renderTable();
  }

  changeValueForm() {
    this.formSearch.valueChanges.subscribe(valForm => {
      if (this.formSearch.valid) {
        if (this.formSearch.controls.receiveEmail.value || this.formSearch.controls.receiveNotify.value || this.formSearch.controls.receiveSMS.value) {
          this.checkValidForm = false;
        } else {
          this.checkValidForm = true;
        }
      }
    });
  }

  onKeydownNumberPhone(value) {
    const key = value.key;
    if (!(key >= 0 || key <= 9 || key == 'Backspace')) {
      return false;
    }
  }

  changeValueCity() {
    this.formSearch.get('city').valueChanges.subscribe(res => {
      if (!this.firstLoad) {
        this.formSearch.controls.district.patchValue('');
        this.formSearch.controls.ward.setValue(null);
      }
      if (res) {
        const findCity = this.listOptionCity.find(x => x.code == res);
        if (findCity) {
          this.noticeAreaName[3] = ` - ${findCity.value}`;
          this.dataModel.noticeAreaName = this.noticeAreaName.join('');
        }
        this.listOptionDistrict = [];
        this.listOptionWard = [];
        this.getListOptionDistrict(res);
      } else {
        this.noticeAreaName[3] = '';
        this.dataModel.noticeAreaName = this.noticeAreaName.join('');
      }
    });
  }

  changeValueDistrict() {
    this.formSearch.get('district').valueChanges.subscribe(res => {
      if (res) {
        if (this.firstLoad) {
          this.firstLoad = false;
        }
        else {
          this.formSearch.controls.ward.setValue(null);
        }
        const findDistrict = this.listOptionDistrict.find(x => x.code == res);
        if (findDistrict) {
          this.noticeAreaName[2] = ` - ${findDistrict.value}`;
          this.dataModel.noticeAreaName = this.noticeAreaName.join('');
        }
        this.listOptionWard = [];
        this.getListOptionWard(res);
      } else {
        this.noticeAreaName[2] = '';
        this.dataModel.noticeAreaName = this.noticeAreaName.join('');
        if (!this.firstLoad)
          this.formSearch.controls.ward.setValue(null);
      }
    });
  }

  changeValueWard() {
    this.formSearch.get('ward').valueChanges.subscribe(res => {
      if (res) {
        const findWard = this.listOptionWard.find(x => x.code == res);
        if (findWard) {
          this.noticeAreaName[1] = ` - ${findWard.value}`;
          this.dataModel.noticeAreaName = this.noticeAreaName.join('');
        }
      } else {
        this.noticeAreaName[1] = '';
        this.dataModel.noticeAreaName = this.noticeAreaName.join('');
      }
    });
  }

  changeValueStreet() {
    this.formSearch.get('noticeAreaCode').valueChanges.subscribe(res => {
      if (res) {
        this.noticeAreaName[0] = res.trim();
        this.dataModel.noticeAreaName = this.noticeAreaName.join('');
      } else {
        this.noticeAreaName[0] = '';
        this.dataModel.noticeAreaName = this.noticeAreaName.join('');
      }
    });
  }

  patchValueAddress() {
    const findCity = this.listOptionCity.find(x => x.code == this.formSearch.get('city').value);
    this.noticeAreaName[3] = findCity ? ` - ${findCity.value}` : '';
    const findDictrict = this.listOptionDistrict.find(x => x.code == this.formSearch.get('district').value);
    this.noticeAreaName[2] = findDictrict ? ` - ${findDictrict.value}` : '';
    const findWard = this.listOptionWard.find(x => x.code == this.formSearch.get('ward').value);
    this.noticeAreaName[1] = findWard ? ` - ${findWard.value}` : '';
    this.dataModel.noticeAreaName = this.noticeAreaName.join('');
  }

  onClickCopyCustomerInfor(event) {
    this.firstLoad = true;
    if (this.selectedCustomer.custId) {
      this.dataModel.noticeName = this.selectedCustomer.custName;
      this.dataModel.noticePhoneNumber = this.selectedCustomer.phoneNumber;
      this.dataModel.noticeEmail = this.selectedCustomer.email;
      this.dataModel.noticeAreaCode = this.selectedCustomer.areaCode;
      this.dataModel.ward = this.selectedCustomer.areaCode;
      this.dataModel.noticeStreet = this.selectedCustomer.street;
      this.dataModel.noticeAreaName = this.selectedCustomer.areaName;
      this.bindData();
    }
    event.stopPropagation();
  }

  async bindData() {
    await this.getByCodeAddress();
    await this.patchValueAddress();
  }

  //#region DropDown
  async getByCodeAddress() {
    const info = (await this._sharedDirectoryService.getAddressByCode(this.selectedCustomer.areaCode).toPromise()).data[0];
    this.formSearch.controls.city.setValue(info.province);
    this.formSearch.controls.district.setValue(info.district);
  }

  async getListOptionCity() {
    const city = (await this._sharedDirectoryService.getListAreas().toPromise()).data;
    this.listOptionCity = AppStorage.get('list-city').map(val => {
      return {
        code: val.area_code,
        value: val.name
      };
    });
    this.patchValueAddress();
  }

  async getListOptionDistrict(city) {
    const district = (await this._sharedDirectoryService.getListAreas(city).toPromise()).data;
    this.listOptionDistrict = district.map(val => {
      return {
        code: val.area_code,
        value: val.name
      };
    });
    this.patchValueAddress();
  }

  async getListOptionWard(district) {
    const area = (await this._sharedDirectoryService.getListAreas(district).toPromise()).data;
    this.listOptionWard = area.map(val => {
      return {
        code: val.area_code,
        value: val.name
      };
    });
    this.patchValueAddress();
  }

  confirmDialog(): void {

    const dialogData = new ConfirmDialogModel(this.translateService.instant('customer.notification'), this.translateService.instant('contractNew.confirm-new-contract'));

    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.onSave();
      }
    });
  }

  async filter(value: any) {
    if (typeof value === 'object') {
      return;
    }
    this.filteredStates = [];
    const data = (await this._customerInfoService.searchCustomerInfo(value.trim()).toPromise()).data;
    if (data.listData.length > 0) {
      this.filteredStates.push(data.listData[0]);
    }
    return this.filteredStates;
  }
  onSelectedCustomer(event) {
    this.selectedCustomer = event.option.value;
    this.birthDayDate = this.selectedCustomer.birthDate ? this.selectedCustomer.birthDate.split(' ')[0] : null;
    this.dateOfIssue = this.selectedCustomer.dateOfIssue ? this.selectedCustomer.dateOfIssue.split(' ')[0] : null;
    if (this.selectedCustomer.custTypeId == CUSTOMER_TYPE_ID.CA_NHAN_TRONG_NUOC || this.selectedCustomer.custTypeId == CUSTOMER_TYPE_ID.CA_NHAN_NUOC_NGOAI) {
      const findGender = gender.find(x => x.code == this.selectedCustomer.gender);
      this.selectedCustomer.gender = findGender ? findGender.value : '';
      // nếu là KHCN thì lấy thông tin khách hàng cá nhân
      this.formSearch.controls.signName.setValue(this.selectedCustomer.custName);
    }
    else {
      // nếu là khách hàng doanh nghiệp
      // auth: người ủy quyền
      // nếu có người ủy quyền  thì set bằng người ủy quyền, còn không thì lấy người đại diên
      this.formSearch.controls.signName.setValue(this.selectedCustomer.authName ? this.selectedCustomer.authName : this.selectedCustomer.repName);
    }
  }

  getOptionText(option) {
    if (option) {
      return option.custName + ' - ' + option.documentNumber;
    }
  }

  getListDocumentTypeObject() {
    this._commonCRMService.getListDocumentTypeObject(ACTION_TYPE.KYMOIHOPDONG).subscribe(res => {
      this.listOptionLicense = res.data.map(val => {
        return {
          id: val.id,
          value: val.val
        };
      });
    });
  }
  //#endregion

  //#region FileHandle
  chooseFileChange(event) {
    this.chooseFileModal(event, AttachFileComponent);
  }

  chooseFileModal(record?, componentTemplate?) {
    const dialog = this.dialog.open({
      panelClass: 'my-dialog',
      width: '600px',
      data: { record },
    }, componentTemplate);

    dialog.afterClosed().subscribe(res => {
      const licenseName = this.selectedDocument ? this.listOptionLicense.filter(license => license.id == this.selectedDocument)[0].value : '';
      res.forEach(file => {
        const license = {
          documentType: licenseName,
          documentTypeId: this.selectedDocument,
          documentName: file.fileName,
          fileName: file.fileName,
          fileSize: file.fileSize,
          fileBase64: file.fileBase64,
          fullBase64: file.fullBase64
        };
        this.listDataProfile.push(license);
      });
      this.renderTable();
    });
  }

  //#endregion

  resetAllForm() {
    this.formInformation.reset();
    this.birthDayDate = null;
    this.dateOfIssue = null;
    this.value = null;
    this.selectedCustomer = {};
    this.formSearch.reset();
    this.dataModel.payCharge = '1';
    this.dataModel.billCycle = '1';
    this.dataSourceProfile = null;
    this.selectedCustomer.custTypeId = CUSTOMER_TYPE_ID.CA_NHAN_TRONG_NUOC;
    this.formSearch.controls.noticeName.clearValidators();
    this.formSearch.controls.noticeName.updateValueAndValidity();
    this.formSearch.controls.city.clearValidators();
    this.formSearch.controls.city.updateValueAndValidity();
    this.formSearch.controls.district.clearValidators();
    this.formSearch.controls.district.updateValueAndValidity();
    this.formSearch.controls.ward.clearValidators();
    this.formSearch.controls.ward.updateValueAndValidity();
    this.formSearch.controls.noticeAreaCode.clearValidators();
    this.formSearch.controls.noticeAreaCode.updateValueAndValidity();
    this.formSearch.controls.noticeAreaName.clearValidators();
    this.formSearch.controls.noticeAreaName.updateValueAndValidity();
    this.formSearch.controls.noticePhoneNumber.clearValidators();
    this.formSearch.controls.noticePhoneNumber.updateValueAndValidity();
    this.formSearch.controls.noticeEmail.clearValidators();
    this.formSearch.controls.noticeEmail.updateValueAndValidity();
    this.formSearch.controls.signDate.clearValidators();
    this.formSearch.controls.signDate.updateValueAndValidity();
    this.formSearch.controls.effDate.clearValidators();
    this.formSearch.controls.effDate.updateValueAndValidity();
    this.formSearch.controls.accountUser.clearValidators();
    this.formSearch.controls.accountUser.updateValueAndValidity();
  }

  onSaveContract() {
    this.confirmDialog();
  }

  onSave() {
    this.dataModel.noticeName = this.formSearch.value.noticeName ? this.formSearch.value.noticeName.trim() : '';
    this.dataModel.noticeStreet = this.formSearch.value.noticeAreaCode ? this.formSearch.value.noticeAreaCode.trim() : '';
    this.dataModel.noticeAreaName = this.formSearch.value.noticeAreaName ? this.formSearch.value.noticeAreaName.trim() : '';
    this.dataModel.noticePhoneNumber = this.formSearch.value.noticePhoneNumber ? this.formSearch.value.noticePhoneNumber.trim() : '';
    this.dataModel.noticeEmail = this.formSearch.value.noticeEmail ? this.formSearch.value.noticeEmail.trim() : '';
    this.dataModel.noticeAreaCode = this.formSearch.value.ward;
    this.dataModel.actTypeId = ACTION_TYPE.KYMOIHOPDONG;
    this.dataModel = Object.assign(this.dataModel);
    this.dataModel.signDate = this.signDate ? moment(this.signDate).format(COMMOM_CONFIG.DATE_TIME_FORMAT).toString() : null;
    this.dataModel.effDate = this.effDate ? moment(this.effDate).format(COMMOM_CONFIG.DATE_TIME_FORMAT).toString() : null;
    this.dataModel.expDate = this.expDate ? moment(this.expDate).format(COMMOM_CONFIG.DATE_TIME_EXPIRE_FORMAT).toString() : null;
    this.dataModel.emailNotification = this.dataModel.emailNotification ? 1 : 0;
    this.dataModel.pushNotification = this.dataModel.pushNotification ? 1 : 0;
    this.dataModel.smsNotification = this.dataModel.smsNotification ? 1 : 0;
    this.dataModel.extendSMS = this.formSearch.controls.extendSMS.value ? 1 : 0;
    if (!this.dataModel.expDate) {
      delete this.dataModel.expDate;
    }
    this.dataModel.contractProfileDTOs = this.listDataProfile.map(x => {
      return {
        fileBase64: x.fileBase64,
        documentTypeId: x.documentTypeId,
        fileName: x.fileName,
      };
    });

    this._contractService.addContracts(this.dataModel, this.selectedCustomer.custId).subscribe(rs => {
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        this.toastr.success(this.translateService.instant('contractNew.success-new-contract'));
        this._router.navigate(['register-services']);
        this.routeStore.changeBackToRegisterVehicle(true);
        const objSendRegisterVehicle: InforRegisterVehicleModel = {
          customerId: this.selectedCustomer.custId,
          contractId: rs.data.contractId
        };
        this.routeStore.sendInforRegisterVehicle(objSendRegisterVehicle);
      } else {
        this.toastr.warning(rs.mess.description);
      }
    }, err => {
      this.toastr.error(this.translateService.instant('common.500Error'));
    });
  }

  viewProfile(row) {
    const checkExtension = row.documentName.split('.')[1];
    if (checkExtension != 'pdf') {
      this.openViewImageProfile(row);
    } else {
      this.openViewPdfProfile(row);
    }
  }

  openViewImageProfile(row): void {
    const dialogRef = this.dialog.originalOpen(ViewFileImageComponent, {
      data: row,
      maxWidth: '100%'
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
      }
    });
  }

  openViewPdfProfile(row): void {
    const dialogRef = this.dialog.originalOpen(ViewFilePdfComponent, {
      data: row,
      maxWidth: '100%'
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
      }
    });
  }
}
