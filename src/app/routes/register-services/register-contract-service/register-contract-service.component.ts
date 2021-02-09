import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core/app-config';
import { SelectOptionModel } from '@app/core/models/common.model';
import { ContractRegisterModel, CustomerInforModel } from '@app/core/models/customer-register.model';
import { AppStorage } from '@app/core/services/AppStorage';
import { ContractService } from '@app/core/services/contract/contract.service';
import { ValidationService } from '@app/shared/common/validation.service';
import { AttachFileComponent } from '@app/shared/components/attach-file/attach-file.component';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { ViewFileImageComponent } from '@app/shared/components/view-file-image/view-file-image.component';
import { ViewFilePdfComponent } from '@app/shared/components/view-file-pdf/view-file-pdf.component';
import { ACTION_TYPE, CUSTOMER_TYPE, HTTP_CODE } from '@app/shared/constant/common.constant';
import { CommonCRMService } from '@app/shared/services/common-crm.service';
import { SharedDirectoryService } from '@app/shared/services/shared-directory.service';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog, MtxGridColumn } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { RegisterServicesStore } from '../register-services.store';

@Component({
  selector: 'app-register-contract-service',
  templateUrl: './register-contract-service.component.html',
  styleUrls: ['./register-contract-service.component.scss']
})
export class RegisterContractServiceComponent extends BaseComponent implements OnInit, OnChanges {

  @Input() fullNameCust: string;
  @ViewChild('email') email: ElementRef;
  newContractInforForm: FormGroup;
  contractTCBForm: FormGroup;
  registerServiceForm: FormGroup;
  updateProfileForm: FormGroup;
  dataFormCustomerInfor: CustomerInforModel;
  listOptionCity: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionDistrict: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionWard: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionLicense: SelectOptionModel[] = [] as SelectOptionModel[];
  image: any;
  CUSTOMER_TYPE = CUSTOMER_TYPE;
  customerTypeId = 1;
  checkValidFormContract = true;
  checkRequiredPackageRegister = true;
  checkRequiredInvoiceCycle = true;
  listDataProfile = [];
  dataSourceProfile = new MatTableDataSource<any>(this.listDataProfile);
  columns_profile: MtxGridColumn[];
  displayedColumns_profile = ['stt', 'documentType', 'documentName', 'actionDelete'];
  @ViewChild('tableProfile') tableProfile: MatTable<any>;
  @ViewChild(MatPaginator, { static: true }) paginatorProfile: MatPaginator;
  address = ['', '', '', ''];
  pageSizeList = [10, 20, 50, 100];
  indexPaginator = 0;
  checkValidNofify = false;
  minExpireDate: Date;
  selectLicence = true;
  cacheDataContract: any = {};
  firstLoad = true;

  constructor(
    private _commonCRMService: CommonCRMService,
    private _contractRegisterService: ContractService,
    private _sharedDirectoryService: SharedDirectoryService,
    private registerServicesStore: RegisterServicesStore,
    private fb: FormBuilder,
    public actr: ActivatedRoute,
    protected translateService: TranslateService,
    public dialog?: MtxDialog,
    protected toastr?: ToastrService
  ) {
    super(actr, RESOURCE.CUSTOMER);
  }

  ngOnInit() {
    this.buildForm();
    this.inItColumns();
    this.changeDataCity();
    this.changeDataDistrict();
    this.getListLicense();
    this.changeDataFormContract();
    this.subscribleCustomerRegisterStore();
    this.changeDataStreet();
    this.changeDataWard();
    this.changeDataEffDate();
    this.changeDataLicense();
    this.getListCity();
    this.dataSourceProfile.paginator = this.paginatorProfile;
    const effDate = new Date(this.newContractInforForm.get('effectiveDate').value);
    this.minExpireDate = new Date(effDate.getFullYear(), effDate.getMonth(), effDate.getDate());
    if (AppStorage.get('cache-data-contract')) {
      this.cacheDataContract = AppStorage.get('cache-data-contract');
    }
    this.patchValueFormCacheData();
  }

  ngOnChanges(change) {
    if (change.fullNameCust.currentValue) {
      this.cacheSinger();
    }
  }

  subscribleCustomerRegisterStore() {
    this.registerServicesStore.currentCustomerInfor$.subscribe((res: CustomerInforModel) => {
      this.dataFormCustomerInfor = res;
      if (this.dataFormCustomerInfor) {
        this.customerTypeId = this.dataFormCustomerInfor.customerTypeId;
      }
    });

    this.registerServicesStore.currentListOptionDistrict$.subscribe((res: SelectOptionModel[]) => {
      this.listOptionDistrict = res;
    });

    this.registerServicesStore.currentListOptionWard$.subscribe((res: SelectOptionModel[]) => {
      this.listOptionWard = res;
    });

  }

  buildForm() {
    this.newContractInforForm = this.fb.group(
      {
        contractId: [''],
        contractNumber: [''],
        signDay: [new Date(Date.now()), Validators.required],
        staff: [AppStorage.getUserLogin()],
        effectiveDate: [new Date(Date.now()), [Validators.required]],
        expiryDate: [''],
        signer: [''],
      }
    );
    this.contractTCBForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(510), ValidationService.cannotWhiteSpace]],
      city: ['', Validators.required],
      district: ['', Validators.required],
      ward: ['', Validators.required],
      street: ['', [Validators.required, Validators.maxLength(255), ValidationService.cannotWhiteSpace]],
      address: ['', [Validators.required, Validators.maxLength(510), ValidationService.cannotWhiteSpace]],
      numberPhone: ['', [Validators.required, Validators.pattern(COMMOM_CONFIG.NUMBER_PHONE_FORMAT)]],
      email: ['', [Validators.pattern(COMMOM_CONFIG.EMAIL_FORMAT)]]
    });

    this.registerServiceForm = this.fb.group({
      packageRegister: ['1', Validators.required],
      invoiceCycle: ['1', Validators.required],
      receiveEmail: [''],
      receiveNotify: [''],
      receiveSMS: [''],
      extendSMS: ['']
    });

    this.updateProfileForm = this.fb.group({
      license: ['']
    });
  }

  onPaginateChange(event) {
    this.indexPaginator = event.pageIndex * event.pageSize;
  }

  changeDataEffDate() {
    this.newContractInforForm.get('effectiveDate').valueChanges.subscribe(val => {
      if (val) {
        const effDate = new Date(val);
        this.minExpireDate = new Date(effDate.getFullYear(), effDate.getMonth(), effDate.getDate());
      }
    });
  }

  changeDataLicense() {
    this.updateProfileForm.get('license').valueChanges.subscribe(val => {
      if (val) {
        this.selectLicence = false;
      } else {
        this.selectLicence = true;
      }
    });
  }

  changeDataFormContract() {
    this.registerServiceForm.valueChanges.subscribe(val => {
      if (val.packageRegister != '' && val.invoiceCycle != '' && this.newContractInforForm.valid && this.contractTCBForm.valid && !this.checkValidNofify && this.isCheckNotifyEmpty()) {
        this.checkValidFormContract = false;
      } else {
        this.checkValidFormContract = true;
      }
    });

    this.contractTCBForm.valueChanges.subscribe(val => {
      if (this.registerServiceForm.valid && this.newContractInforForm.valid && this.contractTCBForm.valid && !this.checkValidNofify && this.isCheckNotifyEmpty()) {
        this.checkValidFormContract = false;
      } else {
        this.checkValidFormContract = true;
      }
    });

    this.newContractInforForm.valueChanges.subscribe(val => {
      if (this.registerServiceForm.valid && this.newContractInforForm.valid && this.contractTCBForm.valid && !this.checkValidNofify && this.isCheckNotifyEmpty()) {
        this.checkValidFormContract = false;
      } else {
        this.checkValidFormContract = true;
      }
    });
  }

  checkValidNotify() {
    if (this.registerServiceForm.get('receiveEmail').value == true || this.registerServiceForm.get('receiveNotify').value == true || this.registerServiceForm.get('receiveSMS').value == true) {
      this.checkValidNofify = false;
    } else {
      this.checkValidNofify = true;
    }
    if (this.registerServiceForm.valid && this.newContractInforForm.valid && this.contractTCBForm.valid && !this.checkValidNofify) {
      this.checkValidFormContract = false;
    } else {
      this.checkValidFormContract = true;
    }
    this.cacheDataContract.receiveEmail = this.registerServiceForm.get('receiveEmail').value;
    this.cacheDataContract.receiveNotify = this.registerServiceForm.get('receiveNotify').value;
    this.cacheDataContract.receiveSMS = this.registerServiceForm.get('receiveSMS').value;
    this.cacheDataContract.extendSMS = this.registerServiceForm.get('extendSMS').value;
    AppStorage.set('cache-data-contract', this.cacheDataContract);
  }

  isCheckNotifyEmpty() {
    return this.registerServiceForm.get('receiveEmail').value != '' || this.registerServiceForm.get('receiveNotify').value != '' || this.registerServiceForm.get('receiveSMS').value != '';
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

  onKeydownNumberPhone(value) {
    const key = value.key;
    if (!(key >= 0 || key <= 9 || key == 'Backspace' || key == 'Tab' || key == 'Shift')) {
      return false;
    }
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
      data: row
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {

      }
    });
  }

  openViewPdfProfile(row): void {
    const dialogRef = this.dialog.originalOpen(ViewFilePdfComponent, {
      data: row
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {

      }
    });
  }

  deleteProfile(i) {
    this.listDataProfile.splice(i + this.indexPaginator, 1);
    this.renderTable();
    // this.confirmDialogDeleteProfile(i);
  }

  // confirmDialogDeleteProfile(i): void {
  //   const message = this.translateService.instant('common.confirm.delete-file');
  //   const dialogData = new ConfirmDialogModel(this.translateService.instant('common.confirm.title.delete'), message);
  //   const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
  //     maxWidth: "400px",
  //     data: dialogData
  //   });

  //   dialogRef.afterClosed().subscribe(dialogResult => {
  //     if (dialogResult) {
  //       this.listDataProfile.splice(i + this.indexPaginator, 1);
  //       this.renderTable();
  //     }
  //   });
  // }

  resetFormContractInfor() {
    this.newContractInforForm.reset();
    this.contractTCBForm.reset();
    this.registerServiceForm.reset();
    this.updateProfileForm.reset();
  }

  onSaveContractInfor() {
    const objValueForm: ContractRegisterModel = {
      newContractInforForm: this.newContractInforForm.value,
      contractTCBForm: this.contractTCBForm.value,
      registerServiceForm: this.registerServiceForm.value,
      updateProfileForm: this.updateProfileForm.value
    };
    this.confirmDialog(objValueForm);
  }

  confirmDialog(value: any): void {
    const message = this.translateService.instant('dialog.content-register-contract');
    const dialogData = new ConfirmDialogModel(this.translateService.instant('dialog.title-register-contract'), message);
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        const listFile = this.listDataProfile.map(val => {
          return {
            documentTypeId: val.documentTypeId,
            fileName: val.fileName,
            fileSize: val.fileSize,
            fileBase64: val.fileBase64
          };
        });
        let expDate = null;
        if (this.newContractInforForm.value.expiryDate != '') {
          expDate = moment(this.newContractInforForm.value.expiryDate).format(COMMOM_CONFIG.DATE_TIME_EXPIRE_FORMAT);
        }

        const body = {
          signDate: moment(this.newContractInforForm.value.signDay).format(COMMOM_CONFIG.DATE_TIME_FORMAT),
          signName: this.fullNameCust ? this.fullNameCust.trim() : '',
          effDate: moment(this.newContractInforForm.value.effectiveDate).format(COMMOM_CONFIG.DATE_TIME_FORMAT),
          expDate,
          emailNotification: this.registerServiceForm.value.receiveEmail ? '1' : '0',
          smsNotification: this.registerServiceForm.value.receiveSMS ? '1' : '0',
          smsRenew: this.registerServiceForm.value.extendSMS ? '1' : '0',
          pushNotification: this.registerServiceForm.value.receiveNotify ? '1' : '0',
          billCycle: this.registerServiceForm.value.invoiceCycle,
          payCharge: this.registerServiceForm.value.packageRegister,
          accountUser: AppStorage.getUserLogin(),
          noticeName: this.contractTCBForm.value.fullName ? this.contractTCBForm.value.fullName.trim() : '',
          noticeAreaName: this.contractTCBForm.value.address ? this.contractTCBForm.value.address.trim() : '',
          noticeStreet: this.contractTCBForm.value.street ? this.contractTCBForm.value.street.trim() : '',
          noticeEmail: this.contractTCBForm.value.email ? this.contractTCBForm.value.email.trim() : '',
          noticePhoneNumber: this.contractTCBForm.value.numberPhone ? this.contractTCBForm.value.numberPhone.trim() : '',
          noticeAreaCode: this.contractTCBForm.value.ward,
          contractProfileDTOs: listFile,
          actTypeId: ACTION_TYPE.KYMOIHOPDONG
        };

        this._contractRegisterService.contractRegister(this.dataFormCustomerInfor.customerCode, body).subscribe(res => {
          if (res.mess.code == HTTP_CODE.SUCCESS) {
            AppStorage.set('step-register-service', 2);
            this.clearCacheData();
            this.toastr.success(this.translateService.instant('common.registerContractSuccess'));
            this.newContractInforForm.get('contractId').patchValue(res.data.contractId);
            this.newContractInforForm.get('contractNumber').patchValue(res.data.contractNo);
            const objValueForm: ContractRegisterModel = {
              newContractInforForm: this.newContractInforForm.value,
              contractTCBForm: this.contractTCBForm.value,
              registerServiceForm: this.registerServiceForm.value,
              updateProfileForm: this.updateProfileForm.value
            };
            this.registerServicesStore.changeContractInfor(objValueForm);
          } else {
            this.toastr.error(res.mess.description);
          }
        }, err => {
          this.toastr.error(err.mess.description);
        });
      }
    });
  }

  chooseFileChange(event) {
    this.chooseFileModal(event, AttachFileComponent);
  }

  chooseFileModal(record?, componentTemplate?) {
    const dialog = this.dialog.open({
      width: '600px',
      data: { record },
    }, componentTemplate);

    dialog.afterClosed().subscribe(res => {
      const licenseName = this.updateProfileForm.value.license ? this.listOptionLicense.filter(license => license.code == this.updateProfileForm.value.license)[0].value : '';
      let stt = 1;
      res.forEach(file => {
        const license = {
          stt: stt++,
          documentType: licenseName,
          documentTypeId: this.updateProfileForm.value.license,
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

  onClickCopyCustomerInfor(event) {
    this.patchValueCopyFormCustomer();
    this.cacheTCBFullName();
    this.cacheCity();
    this.cacheDistrict();
    this.cacheWard();
    this.cacheTCBStreet();
    this.cacheTCBAddrress();
    this.cacheTCBNumberPhone();
    this.cacheTCBEmail();
    event.stopPropagation();
  }

  patchValueAddress() {
    const findCity = this.listOptionCity.find(x => x.code == this.contractTCBForm.get('city').value);
    this.address[3] = findCity ? ` - ${findCity.value}` : '';
    const findDictrict = this.listOptionDistrict ? this.listOptionDistrict.find(x => x.code == this.contractTCBForm.get('district').value) : '';
    this.address[2] = findDictrict ? ` - ${findDictrict.value}` : '';
    const findWard = this.listOptionWard ? this.listOptionWard.find(x => x.code == this.contractTCBForm.get('ward').value) : '';
    this.address[1] = findWard ? ` - ${findWard.value}` : '';
    this.contractTCBForm.get('address').patchValue(this.address.join(''));
  }

  getListCity() {
    this.listOptionCity = AppStorage.get('list-city').map(val => {
      return {
        code: val.area_code,
        value: val.name
      };
    });
    if (AppStorage.get('cache-data-contract')?.cityTCB) {
      if (this.firstLoad)
        this.contractTCBForm.get('city').patchValue(AppStorage.get('cache-data-contract').cityTCB);
    }
  }

  getListDistrict(parentCode) {
    this._sharedDirectoryService.getListAreas(parentCode).subscribe(res => {
      this.listOptionDistrict = res.data.map(val => {
        return {
          code: val.area_code,
          value: val.name
        };
      });
      if (AppStorage.get('cache-data-contract')?.districtTCB) {
        if (this.firstLoad)
          this.contractTCBForm.get('district').patchValue(AppStorage.get('cache-data-contract').districtTCB);
      }
    });
  }

  getListWard(parentCode) {
    this._sharedDirectoryService.getListAreas(parentCode).subscribe(res => {
      this.listOptionWard = res.data.map(val => {
        return {
          code: val.area_code,
          value: val.name
        };
      });
      if (AppStorage.get('cache-data-contract')?.wardTCB) {
        if (this.firstLoad) {
          this.contractTCBForm.get('ward').patchValue(AppStorage.get('cache-data-contract').wardTCB);
          this.firstLoad = false;
        }
      }
    });
  }

  changeDataStreet() {
    this.contractTCBForm.get('street').valueChanges.subscribe(val => {
      this.address[0] = val;
      this.contractTCBForm.get('address').patchValue(this.address.join(''));
    });
  }

  changeDataCity() {
    this.contractTCBForm.get('city').valueChanges.subscribe(val => {
      this.contractTCBForm.get('district').patchValue('');
      this.contractTCBForm.get('ward').patchValue('');
      if (val) {
        this.getListDistrict(val);
        this.patchValueAddress();
      }
    });
  }

  changeDataDistrict() {
    this.contractTCBForm.get('district').valueChanges.subscribe(val => {
      this.contractTCBForm.get('ward').patchValue('');
      if (val) {
        this.getListWard(val);
        this.patchValueAddress();
      }
    });
  }

  changeDataWard() {
    this.contractTCBForm.get('ward').valueChanges.subscribe(val => {
      this.patchValueAddress();
    });
  }

  patchValueCopyFormCustomer() {
    this.contractTCBForm.patchValue({
      fullName: this.dataFormCustomerInfor.customerTypeId == 1 ? this.dataFormCustomerInfor.fullName : this.dataFormCustomerInfor.companyName,
      city: this.dataFormCustomerInfor.city,
      district: this.dataFormCustomerInfor.district,
      ward: this.dataFormCustomerInfor.ward,
      street: this.dataFormCustomerInfor.street,
      address: this.dataFormCustomerInfor.address,
      numberPhone: this.dataFormCustomerInfor.numberPhone ? this.dataFormCustomerInfor.numberPhone.trim() : '',
      email: this.dataFormCustomerInfor.email
    });
  }

  getListLicense() {
    this._commonCRMService.getListDocumentTypeObject(ACTION_TYPE.KYMOIHOPDONG).subscribe(res => {
      this.listOptionLicense = res.data.map(val => {
        return {
          code: val.id,
          value: val.val
        };
      });
      if (AppStorage.get('cache-data-contract')?.license) {
        this.updateProfileForm.get('license').patchValue(AppStorage.get('cache-data-contract').license);
      }
    });
  }

  renderTable() {
    this.dataSourceProfile.paginator = this.paginatorProfile;
    this.tableProfile.renderRows();
  }

  // access cache data
  cacheSinger() {
    this.cacheDataContract.signer = this.fullNameCust;
    AppStorage.set('cache-data-contract', this.cacheDataContract);
  }

  cacheSignDay() {
    this.cacheDataContract.signDay = this.newContractInforForm.get('signDay').value;
    AppStorage.set('cache-data-contract', this.cacheDataContract);
  }

  cacheEffectiveDate() {
    this.cacheDataContract.effectiveDate = this.newContractInforForm.get('effectiveDate').value;
    AppStorage.set('cache-data-contract', this.cacheDataContract);
  }

  // cacheExpiryDate() {
  //   this.cacheDataContract.expiryDate = this.newContractInforForm.get('expiryDate').value;
  //   AppStorage.set('cache-data-contract', this.cacheDataContract);
  // }

  cacheTCBFullName() {
    this.cacheDataContract.fullNameTCB = this.contractTCBForm.get('fullName').value;
    AppStorage.set('cache-data-contract', this.cacheDataContract);
  }

  cacheCity() {
    this.cacheDataContract.cityTCB = this.contractTCBForm.get('city').value;
    AppStorage.set('cache-data-contract', this.cacheDataContract);
  }

  cacheDistrict() {
    this.cacheDataContract.districtTCB = this.contractTCBForm.get('district').value;
    AppStorage.set('cache-data-contract', this.cacheDataContract);
  }

  cacheWard() {
    this.cacheDataContract.wardTCB = this.contractTCBForm.get('ward').value;
    AppStorage.set('cache-data-contract', this.cacheDataContract);
  }

  cacheTCBStreet() {
    this.cacheDataContract.streetTCB = this.contractTCBForm.get('street').value;
    AppStorage.set('cache-data-contract', this.cacheDataContract);
  }

  cacheTCBAddrress() {
    this.cacheDataContract.addressTCB = this.contractTCBForm.get('address').value;
    AppStorage.set('cache-data-contract', this.cacheDataContract);
  }

  cacheTCBNumberPhone() {
    this.cacheDataContract.numberPhoneTCB = this.contractTCBForm.get('numberPhone').value;
    AppStorage.set('cache-data-contract', this.cacheDataContract);
  }

  cacheTCBEmail() {
    this.cacheDataContract.emailTCB = this.contractTCBForm.get('email').value;
    AppStorage.set('cache-data-contract', this.cacheDataContract);
  }

  cachePackageRegister() {
    this.cacheDataContract.packageRegister = this.registerServiceForm.get('packageRegister').value;
    AppStorage.set('cache-data-contract', this.cacheDataContract);
  }

  cacheInvoiceCycle() {
    this.cacheDataContract.invoiceCycle = this.registerServiceForm.get('invoiceCycle').value;
    AppStorage.set('cache-data-contract', this.cacheDataContract);
  }


  cacheLicense() {
    this.cacheDataContract.license = this.updateProfileForm.get('license').value;
    AppStorage.set('cache-data-contract', this.cacheDataContract);
  }

  patchValueFormCacheData() {
    if (AppStorage.get('cache-data-contract')) {
      this.newContractInforForm.patchValue({
        signer: AppStorage.get('cache-data-contract').signer,
        signDay: moment(moment(AppStorage.get('cache-data-contract').signDay).format(COMMOM_CONFIG.DATE_TIME_FORMAT), COMMOM_CONFIG.DATE_FORMAT).toDate(),
        effectiveDate: moment(moment(AppStorage.get('cache-data-contract').effectiveDate).format(COMMOM_CONFIG.DATE_TIME_FORMAT), COMMOM_CONFIG.DATE_FORMAT).toDate(),
        // expiryDate: moment(moment(AppStorage.get('cache-data-contract').expiryDate).format(COMMOM_CONFIG.DATE_TIME_FORMAT), COMMOM_CONFIG.DATE_FORMAT).toDate()
      });

      this.contractTCBForm.patchValue({
        fullName: AppStorage.get('cache-data-contract').fullNameTCB,
        street: AppStorage.get('cache-data-contract').streetTCB,
        address: AppStorage.get('cache-data-contract').addressTCB,
        numberPhone: AppStorage.get('cache-data-contract').numberPhoneTCB,
        email: AppStorage.get('cache-data-contract').emailTCB
      });

      this.registerServiceForm.patchValue({
        packageRegister: AppStorage.get('cache-data-contract').packageRegister,
        invoiceCycle: AppStorage.get('cache-data-contract').invoiceCycle,
        receiveEmail: AppStorage.get('cache-data-contract').receiveEmail,
        receiveNotify: AppStorage.get('cache-data-contract').receiveNotify,
        receiveSMS: AppStorage.get('cache-data-contract').receiveSMS,
        extendSMS: AppStorage.get('cache-data-contract').extendSMS
      });
    }
  }

  clearCacheData() {
    if (AppStorage.get('cache-data-contract')) {
      AppStorage.set('cache-data-contract', null);
    }
  }
}

