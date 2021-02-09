import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';
import { SelectOptionModel } from '@app/core/models/common.model';
import { AppStorage } from '@app/core/services/AppStorage';
import { CustomerService } from '@app/core/services/customer/customer.service';
import { ValidationService } from '@app/shared/common/validation.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { ACTION_TYPE, CUSTOMER_TYPE, gender, HTTP_CODE } from '@app/shared/constant/common.constant';
import { CommonCRMService } from '@app/shared/services/common-crm.service';
import { PubSubEventService } from '@app/shared/services/pubsub-event.service';
import { SharedDirectoryService } from '@app/shared/services/shared-directory.service';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CustomerInformationAuthorizedComponent } from './customer-information-authorized/customer-information-authorized.component';
import { CustomerInformationRepresentativeComponent } from './customer-information-representative/customer-information-representative.component';

@Component({
  selector: 'app-customer-information',
  templateUrl: './customer-information.component.html',
  styleUrls: ['./customer-information.component.scss']
})
export class CustomerInformationComponent extends BaseComponent implements OnInit, OnDestroy {

  customerRegisterForm: FormGroup;
  @ViewChild('representativeForm') dataRepresentativeForm: CustomerInformationRepresentativeComponent;
  @ViewChild('authorizedPersonForm') dataAuthorizedPersonForm: CustomerInformationAuthorizedComponent;
  @ViewChild('documentNumberRef') documentNumberRef: ElementRef;
  @ViewChild('taxNo') taxNo: ElementRef;
  @Output() emitFullName = new EventEmitter<string>();
  @Output() formStatus = new EventEmitter<boolean>();
  listOptionCustomerType: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionDocumentType: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionCity: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionDistrict: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionWard: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionGender: SelectOptionModel[] = gender;
  customerTypeId = 1;
  isDisableBtnSave = true;
  address = ['', '', '', ''];
  dateNow = new Date();
  currentDate = new Date(this.dateNow.getFullYear() - 18, this.dateNow.getMonth(), this.dateNow.getDate());
  checkValidFormRep = true;
  detailAddress: any;
  sub: Subscription;
  constructor(
    private _commonCRMService: CommonCRMService,
    private _customerRegisterService: CustomerService,
    private _sharedDirectoryService: SharedDirectoryService,
    public actr: ActivatedRoute,
    private fb: FormBuilder,
    protected translateService: TranslateService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
    public _pubSubEventService?: PubSubEventService
  ) {
    super(actr, _customerRegisterService, RESOURCE.CUSTOMER);
  }
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
  ngOnInit() {
    this.buildForm();
    this.changeDataCity();
    this.changeDataDistrict();
    this.changeValueCustomerType();
    this.getListCustomerType();
    this.getListCity();
    this.setValidate();
    this.changeValueStreet();
    this.changeValueForm();
    this.changeDataWard();
    this.changeDataTaxNo();
    this.sub = this.customerRegisterForm.valueChanges.pipe(take(1)).subscribe(rs => {
      this.formStatus.emit(true);
    });
    if (AppStorage.getLoginByToken()) {
      this.bindDataVTP();
    } else {
      this.dataModel.infoFromVtPost = {};
    }
  }
  /**
   * Bind data cho VTP khi login bằng token
   */
  bindDataVTP() {
    const orderNumber = AppStorage.get('order_number');
    this._customerRegisterService.getOrderCustomerRegister(orderNumber).subscribe(rs => {
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        this.customerRegisterForm.patchValue({
          numberPhone: rs.data?.phoneNumber,
          email: rs.data?.email,
          fullName: rs.data?.custName,
          companyName: rs.data?.custName,
          dateOfBirth: moment(moment(rs.data?.birthDate).format(COMMOM_CONFIG.DATE_TIME_FORMAT), COMMOM_CONFIG.DATE_FORMAT).toDate(),
          foundingDate: moment(moment(rs.data?.birthDate).format(COMMOM_CONFIG.DATE_TIME_FORMAT), COMMOM_CONFIG.DATE_FORMAT).toDate(),
          gender: rs.data?.gender,
          // companyName: AppStorage.get('cache-data-customer')?.companyName,
          taxNo: rs.data?.taxCode,
          documentNumber: rs.data?.documentNumber,
          // foundingDate: moment(moment(AppStorage.get('cache-data-customer')?.foundingDate).format(COMMOM_CONFIG.DATE_TIME_FORMAT), COMMOM_CONFIG.DATE_FORMAT).toDate(),
          dateRange: moment(moment(rs.data?.dateOfIssue).format(COMMOM_CONFIG.DATE_TIME_FORMAT), COMMOM_CONFIG.DATE_FORMAT).toDate(),
          placeOfIssue: rs.data?.placeOfIssue,
          street: rs.data?.street,
          customerTypeId: null
        });
        this.dataModel.infoFromVtPost = rs.data;
        this.customerTypeId = rs.data?.custTypeId
      }
    })
  }
  buildForm() {
    this.customerRegisterForm = this.fb.group({
      customerTypeId: [''],
      customerType: ['', Validators.required],
      customerName: [''],
      customerCode: [''],
      email: ['', [Validators.pattern(COMMOM_CONFIG.EMAIL_FORMAT), Validators.maxLength(255), ValidationService.cannotWhiteSpace]],
      fullName: ['', [Validators.required, Validators.maxLength(510), ValidationService.cannotWhiteSpace]],
      dateOfBirth: [''],
      gender: [''],
      genderName: [''],
      documentType: ['', Validators.required],
      documentName: [''],
      documentNumber: ['', [Validators.required, Validators.maxLength(20), ValidationService.cannotWhiteSpace]],
      dateRange: ['', Validators.required],
      placeOfIssue: ['', [Validators.required, Validators.maxLength(255), ValidationService.cannotWhiteSpace]],
      city: ['', Validators.required],
      cityName: [''],
      district: ['', Validators.required],
      districtName: [''],
      ward: ['', Validators.required],
      wardName: [''],
      street: ['', [Validators.required, Validators.maxLength(255), ValidationService.cannotWhiteSpace]],
      address: ['', [Validators.required, Validators.maxLength(510), ValidationService.cannotWhiteSpace]],
      numberPhone: ['', [Validators.required, Validators.pattern(COMMOM_CONFIG.NUMBER_PHONE_FORMAT)]],
      companyName: [''],
      taxNo: [''],
      foundingDate: ['']
    });
  }

  setValidate() {
    if (this.customerTypeId == CUSTOMER_TYPE.CA_NHAN) {
      this.customerRegisterForm.controls.fullName.setValidators([Validators.required, Validators.maxLength(510), ValidationService.cannotWhiteSpace]);
      this.customerRegisterForm.controls.fullName.updateValueAndValidity();
      this.customerRegisterForm.controls.dateOfBirth.setValidators(Validators.required);
      this.customerRegisterForm.controls.dateOfBirth.updateValueAndValidity();
      this.customerRegisterForm.controls.companyName.clearValidators();
      this.customerRegisterForm.controls.companyName.updateValueAndValidity();
      this.customerRegisterForm.controls.taxNo.clearValidators();
      this.customerRegisterForm.controls.taxNo.updateValueAndValidity();
      this.customerRegisterForm.controls.foundingDate.clearValidators();
      this.customerRegisterForm.controls.foundingDate.updateValueAndValidity();
      this.customerRegisterForm.patchValue({
        companyName: '',
        taxNo: '',
        foundingDate: ''
      });
    } else {
      this.customerRegisterForm.controls.companyName.setValidators([Validators.required, ValidationService.cannotWhiteSpace]);
      this.customerRegisterForm.controls.companyName.updateValueAndValidity();
      this.customerRegisterForm.controls.taxNo.setValidators([Validators.required, ValidationService.cannotWhiteSpace]);
      this.customerRegisterForm.controls.taxNo.updateValueAndValidity();
      this.customerRegisterForm.controls.foundingDate.setValidators(Validators.required);
      this.customerRegisterForm.controls.foundingDate.updateValueAndValidity();
      this.customerRegisterForm.controls.fullName.clearValidators();
      this.customerRegisterForm.controls.fullName.updateValueAndValidity();
      this.customerRegisterForm.controls.dateOfBirth.clearValidators();
      this.customerRegisterForm.controls.dateOfBirth.updateValueAndValidity();
      this.customerRegisterForm.patchValue({
        fullName: '',
        dateOfBirth: '',
        gender: ''
      });
    }
  }

  changeValueForm() {
    this.customerRegisterForm.valueChanges.subscribe(res => {
      if (this.customerTypeId == CUSTOMER_TYPE.CA_NHAN) {
        if (this.customerRegisterForm.valid) {
          this.isDisableBtnSave = false;
        } else {
          this.isDisableBtnSave = true;
        }
      } else {
        if (this.customerRegisterForm.valid && this.dataRepresentativeForm.customerEnterpriseForm.valid) {
          this.isDisableBtnSave = false;
        } else {
          this.isDisableBtnSave = true;
        }
      }
    });
  }

  changeDataTaxNo() {
    this.customerRegisterForm.get('taxNo').valueChanges.subscribe(val => {
      this.customerRegisterForm.get('documentNumber').patchValue(val);
    });
  }

  changeValueStreet() {
    this.customerRegisterForm.get('street').valueChanges.subscribe(val => {
      this.address[0] = val;
      this.customerRegisterForm.get('address').patchValue(this.address.join(''));
    });
  }

  validFormEnterprise(value) {
    this.checkValidFormRep = value;
    if (this.customerTypeId != CUSTOMER_TYPE.CA_NHAN) {
      if (this.customerRegisterForm.valid && value) {
        this.isDisableBtnSave = false;
      } else {
        this.isDisableBtnSave = true;
      }
    }
  }

  validFormAuthorized(value) {
    if (this.customerTypeId != CUSTOMER_TYPE.CA_NHAN) {
      if (this.customerRegisterForm.valid && this.checkValidFormRep && value) {
        this.isDisableBtnSave = false;
      } else {
        this.isDisableBtnSave = true;
      }
    }
  }

  changeDataCity() {
    this.customerRegisterForm.get('city').valueChanges.subscribe(val => {
      this.customerRegisterForm.controls.district.reset();
      this.customerRegisterForm.controls.ward.reset();
      if (val) {
        this.listOptionDistrict = [];
        this.listOptionWard = [];
        this.address[1] = '',
          this.address[2] = '';
        this.getListDistrict(val);
        const cityDisplay = this.listOptionCity.filter(city => city.code == val)[0].value;
        this.address[3] = ` - ${cityDisplay}`;
        this.customerRegisterForm.get('address').patchValue(this.address.join(''));
      }
    });
  }

  changeDataDistrict() {
    this.customerRegisterForm.get('district').valueChanges.subscribe(val => {
      this.customerRegisterForm.controls.ward.reset();
      if (val) {
        this.address[1] = '';
        this.getListWard(val);
        const districtDispaly = this.listOptionDistrict.filter(district => district.code == val)[0].value;
        this.address[2] = ` - ${districtDispaly}`;
        this.customerRegisterForm.get('address').patchValue(this.address.join(''));
      }
    });
  }

  changeDataWard() {
    this.customerRegisterForm.get('ward').valueChanges.subscribe(val => {
      if (val) {
        const wardDisplay = this.listOptionWard.filter(ward => ward.code == val)[0].value;
        this.address[1] = ` - ${wardDisplay}`;
        this.customerRegisterForm.get('address').patchValue(this.address.join(''));
      }
    });
  }

  changeValueCustomerType() {
    this.customerRegisterForm.get('customerType').valueChanges.subscribe(val => {
      if (val) {
        this.customerRegisterForm.get('documentType').patchValue('');
        this.customerTypeId = this.listOptionCustomerType.filter(x => x.code == val)[0].id;
        this.getListDocumentTypeByCustomer(val);
        this.setValidate();
      }
    });
  }

  getListCustomerType() {
    this._sharedDirectoryService.getListCustomerType().subscribe(res => {
      this.listOptionCustomerType = res.data.map(val => {
        return {
          id: val.type,
          code: val.cust_type_id,
          value: `[${val.code}] ${val.name}`
        };
      });
    });
  }

  getListDocumentTypeByCustomer(customerId) {
    this._commonCRMService.getListDocumentTypeByCustomer(customerId).subscribe(res => {
      this.listOptionDocumentType = res.data.map(val => {
        return {
          code: val.id,
          value: val.val
        };
      });
    });
  }

  getListCity() {
    this._sharedDirectoryService.getListAreas().subscribe(res => {
      this.listOptionCity = res.data.map(val => {
        return {
          code: val.area_code,
          value: val.name
        };
      });
    });
  }

  getListDistrict(parentCode,) {
    this._sharedDirectoryService.getListAreas(parentCode).subscribe(res => {
      this.listOptionDistrict = res.data.map(val => {
        return {
          code: val.area_code,
          value: val.name
        };
      });
      if (this.detailAddress) {
        this.customerRegisterForm.patchValue({
          district: this.detailAddress.district
        });
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
      if (this.detailAddress) {
        this.customerRegisterForm.patchValue({
          ward: this.detailAddress.area_code
        });
      }
    });
  }

  resetFormRegister() {
    this.customerRegisterForm.reset();
    this.formStatus.emit(false);
    if (this.dataRepresentativeForm) {
      this.dataRepresentativeForm.customerEnterpriseForm.reset();
    }
    if (this.dataAuthorizedPersonForm) {
      this.dataAuthorizedPersonForm.customerEnterpriseForm.reset();
    }
    this.address = ['', '', '', ''];
  }

  onKeypressNumberPhone(value) {
    const key = value.key;
    if (!(key >= 0 || key <= 9)) {
      return false;
    }
  }

  onKeyupNumberPhone(value) {
    const data = {
      phoneNumber: this.customerRegisterForm.get('numberPhone').value
    };
    this._customerRegisterService.getCustomerByNumberPhone(data).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS && res.data.count > 0) {
        this.patchValueFormCustomer(res.data.listData[0]);
        this._pubSubEventService.pub$('CUSTOMER_INFORMATION.DETAIL_CUSTOMER_REGISTER', res.data.listData[0])
      }
    });
  }

  patchValueFormCustomer(formValue) {
    this.customerRegisterForm.patchValue({
      customerType: formValue.hasOwnProperty('custTypeId') ? formValue.custTypeId : '',
      email: formValue.hasOwnProperty('email') ? formValue.email : '',
      fullName: formValue.hasOwnProperty('custName') ? formValue.custName : '',
      dateOfBirth: formValue.hasOwnProperty('birthDate') ? new Date(formValue.birthDate) : '',
      gender: formValue.hasOwnProperty('gender') ? formValue.gender : '',
      documentType: formValue.hasOwnProperty('documentTypeId') ? formValue.documentTypeId : '',
      documentNumber: formValue.hasOwnProperty('documentNumber') ? formValue.documentNumber : '',
      dateRange: formValue.hasOwnProperty('dateOfIssue') ? new Date(formValue.dateOfIssue) : '',
      placeOfIssue: formValue.hasOwnProperty('placeOfIssue') ? formValue.placeOfIssue : '',
      street: formValue.hasOwnProperty('street') ? formValue.street : '',
      address: formValue.hasOwnProperty('areaName') ? formValue.areaName : '',
      companyName: formValue.hasOwnProperty('custName') ? formValue.custName : '',
      taxNo: formValue.hasOwnProperty('taxCode') ? formValue.taxCode : '',
      foundingDate: formValue.hasOwnProperty('birthDate') ? new Date(formValue.birthDate) : ''
    });
    this.getAddressDetail(formValue.areaCode);
  }

  getAddressDetail(areaCode) {
    this._sharedDirectoryService.getAddressByCode(areaCode).subscribe(res => {
      if (res.data.length > 0) {
        this.detailAddress = res.data[0];
        this.customerRegisterForm.patchValue({
          city: this.detailAddress.province
        });
      }
    });
  }

  onSaveCustomerInfor() {
    this.confirmDialog();
  }

  setNameAreas() {
    const customerTypeDisplay = this.customerRegisterForm.value.customerType ? this.listOptionCustomerType.filter(cust => cust.code == this.customerRegisterForm.value.customerType.toString())[0].value : '';
    const cityDisplay = this.customerRegisterForm.value.city ? this.listOptionCity.filter(city => city.code == this.customerRegisterForm.value.city)[0].value : '';
    const districtDisplay = this.customerRegisterForm.value.district ? this.listOptionDistrict.filter(dist => dist.code == this.customerRegisterForm.value.district)[0].value : '';
    const wardDisplay = this.customerRegisterForm.value.ward ? this.listOptionWard.filter(ward => ward.code == this.customerRegisterForm.value.ward)[0].value : '';
    const genderDispaly = this.customerRegisterForm.value.gender ? this.listOptionGender.filter(g => g.code == this.customerRegisterForm.value.gender.toString())[0].value : '';
    this.customerRegisterForm.patchValue({
      cityName: cityDisplay,
      districtName: districtDisplay,
      wardName: wardDisplay,
      genderName: genderDispaly,
      customerName: customerTypeDisplay
    });
  }

  confirmDialog(): void {
    const message = this.translateService.instant('dialog.content-register-customer');
    const dialogData = new ConfirmDialogModel(this.translateService.instant('dialog.title-register-customer'), message);
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.setNameAreas();
        if (this.customerTypeId == CUSTOMER_TYPE.CA_NHAN) {
          const body = {
            custTypeId: this.customerRegisterForm.value.customerType,
            custId: Number(this.customerRegisterForm.value.customerCode),
            phoneNumber: this.customerRegisterForm.value.numberPhone ? this.customerRegisterForm.value.numberPhone.trim() : '',
            custName: this.customerRegisterForm.value.fullName ? this.customerRegisterForm.value.fullName.trim() : '',
            birthDate: moment(this.customerRegisterForm.value.dateOfBirth).format(COMMOM_CONFIG.DATE_TIME_FORMAT),
            gender: Number(this.customerRegisterForm.value.gender),
            documentTypeId: this.customerRegisterForm.value.documentType,
            documentNumber: this.customerRegisterForm.value.documentNumber ? this.customerRegisterForm.value.documentNumber.trim() : '',
            dateOfIssue: moment(this.customerRegisterForm.value.dateRange).format(COMMOM_CONFIG.DATE_TIME_FORMAT),
            placeOfIssue: this.customerRegisterForm.value.placeOfIssue ? this.customerRegisterForm.value.placeOfIssue.trim() : '',
            areaCode: this.customerRegisterForm.value.ward,
            street: this.customerRegisterForm.value.street ? this.customerRegisterForm.value.street.trim() : '',
            areaName: this.customerRegisterForm.value.address ? this.customerRegisterForm.value.address.trim() : '',
            email: this.customerRegisterForm.value.email ? this.customerRegisterForm.value.email.trim() : '',
            actTypeId: ACTION_TYPE.DANG_KY_KH
          };
          this._customerRegisterService.registerCustomerPersonal(body).subscribe((res) => {
            if (res.mess.code == HTTP_CODE.ALREADY_EXIST_DOCUMENT_NO) {
              this.documentNumberRef.nativeElement.focus();
              this.toastr.warning(res.mess.description);
            } else if (res.mess.code == HTTP_CODE.SUCCESS) {
              this.formStatus.emit(false);
              this.toastr.success(this.translateService.instant('customer.success-create-customer'));
              this.emitFullName.emit(this.customerRegisterForm.value.fullName.trim());
              this.customerRegisterForm.get('customerCode').patchValue(res.data.custId);
              this.customerRegisterForm.get('customerTypeId').patchValue(this.customerTypeId);
            } else {
              this.toastr.error(res.mess.description);
            }
          }, err => {
            this.toastr.error(err.mess.description);
          });
        } else {
          const body = {
            documentTypeId: this.customerRegisterForm.value.documentType,
            custTypeId: this.customerRegisterForm.value.customerType,
            custId: Number(this.customerRegisterForm.value.customerCode),
            phoneNumber: this.customerRegisterForm.value.numberPhone ? this.customerRegisterForm.value.numberPhone.trim() : '',
            custName: this.customerRegisterForm.value.companyName ? this.customerRegisterForm.value.companyName.trim() : '',
            taxCode: this.customerRegisterForm.value.taxNo ? this.customerRegisterForm.value.taxNo.trim() : '',
            birthDate: moment(this.customerRegisterForm.value.foundingDate).format(COMMOM_CONFIG.DATE_TIME_FORMAT),
            documentNumber: this.customerRegisterForm.value.documentNumber ? this.customerRegisterForm.value.documentNumber.trim() : '',
            dateOfIssue: moment(this.customerRegisterForm.value.dateRange).format(COMMOM_CONFIG.DATE_TIME_FORMAT),
            placeOfIssue: this.customerRegisterForm.value.placeOfIssue ? this.customerRegisterForm.value.placeOfIssue.trim() : '',
            areaCode: this.customerRegisterForm.value.ward,
            street: this.customerRegisterForm.value.street ? this.customerRegisterForm.value.street.trim() : '',
            areaName: this.customerRegisterForm.value.address ? this.customerRegisterForm.value.address.trim() : '',
            email: this.customerRegisterForm.value.email ? this.customerRegisterForm.value.email.trim() : '',

            repName: this.dataRepresentativeForm.customerEnterpriseForm.value.fullName ? this.dataRepresentativeForm.customerEnterpriseForm.value.fullName.trim() : '',
            repBirthDate: moment(this.dataRepresentativeForm.customerEnterpriseForm.value.dateOfBirth).format(COMMOM_CONFIG.DATE_TIME_FORMAT),
            repGender: this.dataRepresentativeForm.customerEnterpriseForm.value.gender,
            repIdentityTypeId: this.dataRepresentativeForm.customerEnterpriseForm.value.documentType,
            repIdentityNumber: this.dataRepresentativeForm.customerEnterpriseForm.value.documentNumber ? this.dataRepresentativeForm.customerEnterpriseForm.value.documentNumber.trim() : '',
            repDateOfIssue: moment(this.dataRepresentativeForm.customerEnterpriseForm.value.dateRange).format(COMMOM_CONFIG.DATE_TIME_FORMAT),
            repPlaceOfIssue: this.dataRepresentativeForm.customerEnterpriseForm.value.placeOfIssue ? this.dataRepresentativeForm.customerEnterpriseForm.value.placeOfIssue.trim() : '',
            repAreaCode: this.dataRepresentativeForm.customerEnterpriseForm.value.ward,
            repStreet: this.dataRepresentativeForm.customerEnterpriseForm.value.street ? this.dataRepresentativeForm.customerEnterpriseForm.value.street.trim() : '',
            repAreaName: this.dataRepresentativeForm.customerEnterpriseForm.value.address ? this.dataRepresentativeForm.customerEnterpriseForm.value.address.trim() : '',
            repPhoneNumber: this.dataRepresentativeForm.customerEnterpriseForm.value.numberPhone ? this.dataRepresentativeForm.customerEnterpriseForm.value.numberPhone.trim() : '',
            repEmail: this.dataRepresentativeForm.customerEnterpriseForm.value.email ? this.dataRepresentativeForm.customerEnterpriseForm.value.email.trim() : '',

            authIdentityNumber: this.dataAuthorizedPersonForm.customerEnterpriseForm.value.documentNumber ? this.dataAuthorizedPersonForm.customerEnterpriseForm.value.documentNumber.trim() : '',
            authIdentityTypeId: this.dataAuthorizedPersonForm.customerEnterpriseForm.value.documentType,
            authDateOfIssue: this.dataAuthorizedPersonForm.customerEnterpriseForm.value.dateRange ? moment(this.dataAuthorizedPersonForm.customerEnterpriseForm.value.dateRange).format(COMMOM_CONFIG.DATE_TIME_FORMAT) : null,
            authPlaceOfIssue: this.dataAuthorizedPersonForm.customerEnterpriseForm.value.placeOfIssue ? this.dataAuthorizedPersonForm.customerEnterpriseForm.value.placeOfIssue.trim() : '',
            authName: this.dataAuthorizedPersonForm.customerEnterpriseForm.value.fullName ? this.dataAuthorizedPersonForm.customerEnterpriseForm.value.fullName.trim() : '',
            authBirthDate: this.dataAuthorizedPersonForm.customerEnterpriseForm.value.dateOfBirth ? moment(this.dataAuthorizedPersonForm.customerEnterpriseForm.value.dateOfBirth).format(COMMOM_CONFIG.DATE_TIME_FORMAT) : null,
            authGender: this.dataAuthorizedPersonForm.customerEnterpriseForm.value.gender,
            authAreaName: this.dataAuthorizedPersonForm.customerEnterpriseForm.value.address ? this.dataAuthorizedPersonForm.customerEnterpriseForm.value.address.trim() : '',
            authStreet: this.dataAuthorizedPersonForm.customerEnterpriseForm.value.street ? this.dataAuthorizedPersonForm.customerEnterpriseForm.value.street.trim() : '',
            authAreaCode: this.dataAuthorizedPersonForm.customerEnterpriseForm.value.ward,
            authEmail: this.dataAuthorizedPersonForm.customerEnterpriseForm.value.email ? this.dataAuthorizedPersonForm.customerEnterpriseForm.value.email.trim() : '',
            authPhoneNumber: this.dataAuthorizedPersonForm.customerEnterpriseForm.value.numberPhone ? this.dataAuthorizedPersonForm.customerEnterpriseForm.value.numberPhone.trim() : '',
            actTypeId: ACTION_TYPE.DANG_KY_KH
          };

          this._customerRegisterService.registerCustomerEnterprise(body).subscribe(res => {
            if (res.mess.code == HTTP_CODE.ALREADY_EXIST_TAX_NO) {
              this.taxNo.nativeElement.focus();
              this.toastr.warning(res.mess.description);
            } else if (res.mess.code == HTTP_CODE.SUCCESS) {
              this.formStatus.emit(false);
              this.customerRegisterForm.get('customerCode').patchValue(res.data.custId);
              this.customerRegisterForm.get('customerTypeId').patchValue(this.customerTypeId);
              const signer = this.dataAuthorizedPersonForm.customerEnterpriseForm.value.fullName ? this.dataAuthorizedPersonForm.customerEnterpriseForm.value.fullName.trim() : this.dataRepresentativeForm.customerEnterpriseForm.value.fullName.trim();
              this.emitFullName.emit(signer);
              this.toastr.success(res.mess.description);
            } else {
              this.toastr.error(res.mess.description);
            }
          }, err => {
            this.toastr.error(err.mess.description);
          });
        }
      }
    });
  }

}
