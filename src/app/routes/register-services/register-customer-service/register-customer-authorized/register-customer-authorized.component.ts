import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectOptionModel } from '@app/core/models/common.model';
import { CustomerInforModel } from '@app/core/models/customer-register.model';
import { AppStorage } from '@app/core/services/AppStorage';
import { ValidationService } from '@app/shared/common/validation.service';
import { CUSTOMER_TYPE, gender } from '@app/shared/constant/common.constant';
import { SharedDirectoryService } from '@app/shared/services/shared-directory.service';
import { COMMOM_CONFIG } from '@env/environment';
import moment from 'moment';
import { RegisterServicesStore } from '../../register-services.store';

@Component({
  selector: 'app-register-customer-authorized',
  templateUrl: './register-customer-authorized.component.html',
  styleUrls: ['./register-customer-authorized.component.scss']
})
export class RegisterCustomerAuthorizedComponent implements OnInit, OnDestroy {

  customerEnterpriseForm: FormGroup;
  listOptionGender: SelectOptionModel[] = gender;
  listOptionDocumentType: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionCity: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionDistrict: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionWard: SelectOptionModel[] = [] as SelectOptionModel[];
  @Output() emitValidAuthorizedPerson = new EventEmitter<boolean>();
  dateNow = new Date();
  maxDOB = new Date(this.dateNow.getFullYear() - 18, this.dateNow.getMonth(), this.dateNow.getDate());
  address = ['', '', '', ''];
  detailCustomer: any;
  detailAddress: any;
  cacheDataAuthorized: CustomerInforModel = {} as CustomerInforModel;
  firstLoad = true;
  @Input() infoFromVtPost: any;
  constructor(private fb: FormBuilder,
    private registerServicesStore: RegisterServicesStore,
    private _sharedDirectoryService: SharedDirectoryService,
  ) { }

  ngOnInit() {
    this.buildForm();
    this.changeDataCity();
    this.changeDataDistrict();
    this.changeValueStreet();
    this.changeDataWard();
    this.getListCity();
    this.getListOptionDocumentType();
    this.changeDataFormEnterprise();
    this.subscribleStore();

    this.bindData();
  }
  bindData() {
    if (AppStorage.getLoginByToken()) {
      this.mapOrderCustomerRegister();
    } else {
      this.patchValueFormCacheData();
      if (AppStorage.get('cache-customer-authorized')) {
        this.cacheDataAuthorized = AppStorage.get('cache-customer-authorized');
      }
    }
  }
  /**
   * đơn hàng từ vtpost
   */
  mapOrderCustomerRegister() {
    this.customerEnterpriseForm.patchValue({
      fullName: this.infoFromVtPost?.authName,
      dateOfBirth: moment(moment(this.infoFromVtPost?.authBirthDate).format(COMMOM_CONFIG.DATE_TIME_FORMAT), COMMOM_CONFIG.DATE_FORMAT).toDate(),
      gender: this.infoFromVtPost?.authGender,
      documentNumber: this.infoFromVtPost?.authIdentityNumber,
      dateRange: moment(moment(this.infoFromVtPost?.authDateOfIssue).format(COMMOM_CONFIG.DATE_TIME_FORMAT), COMMOM_CONFIG.DATE_FORMAT).toDate(),
      placeOfIssue: this.infoFromVtPost?.authPlaceOfIssue,
      street: this.infoFromVtPost?.authStreet,
      // address: AppStorage.get('cache-customer-representative')?.address,
      numberPhone: this.infoFromVtPost?.authPhoneNumber,
      email: this.infoFromVtPost?.authEmail
    })
  }
  buildForm() {
    this.customerEnterpriseForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(510), ValidationService.cannotWhiteSpace]],
      dateOfBirth: [null, Validators.required],
      gender: [''],
      documentType: ['', Validators.required],
      documentNumber: ['', [Validators.required, Validators.maxLength(20), ValidationService.cannotWhiteSpace]],
      dateRange: [null, Validators.required],
      placeOfIssue: ['', [Validators.required, Validators.maxLength(255), ValidationService.cannotWhiteSpace]],
      city: ['', Validators.required],
      district: ['', Validators.required],
      ward: ['', Validators.required],
      street: ['', [Validators.required, Validators.maxLength(255), ValidationService.cannotWhiteSpace]],
      address: ['', [Validators.required, Validators.maxLength(510), ValidationService.cannotWhiteSpace]],
      numberPhone: ['', Validators.pattern(COMMOM_CONFIG.NUMBER_PHONE_FORMAT)],
      email: ['', [Validators.pattern(COMMOM_CONFIG.EMAIL_FORMAT), Validators.maxLength(255)]]
    });
  }

  subscribleStore() {
    this.registerServicesStore.currentDetailCustomerRegister$.subscribe(customer => {
      if (customer) {
        this.detailCustomer = customer;
        this.patchValueForm(customer);
      }
    })
  }

  patchValueForm(formValue) {
    this.customerEnterpriseForm.patchValue({
      fullName: formValue.hasOwnProperty('authName') ? formValue.authName : '',
      dateOfBirth: formValue.hasOwnProperty('authBirthDate') ? new Date(formValue.authBirthDate) : null,
      gender: formValue.hasOwnProperty('authGender') ? formValue.authGender : '',
      documentType: formValue.hasOwnProperty('authIdentityTypeId') ? formValue.authIdentityTypeId : '',
      documentNumber: formValue.hasOwnProperty('authIentityNumber') ? formValue.authIentityNumber : '',
      dateRange: formValue.hasOwnProperty('authDateOfIssue') ? new Date(formValue.authDateOfIssue) : null,
      placeOfIssue: formValue.hasOwnProperty('authPlaceOfIssue') ? formValue.authPlaceOfIssue : '',
      street: formValue.hasOwnProperty('authStreet') ? formValue.authStreet : '',
      numberPhone: formValue.hasOwnProperty('authPhoneNumber') ? formValue.authPhoneNumber : '',
      email: formValue.hasOwnProperty('authEmail') ? formValue.authEmail : ''
    })
    this.getAddressDetail(formValue.repAreaCode);
  }

  getAddressDetail(areaCode) {
    this._sharedDirectoryService.getAddressByCode(areaCode).subscribe(res => {
      if (res.data.length > 0) {
        this.detailAddress = res.data[0];
        this.customerEnterpriseForm.patchValue({
          city: this.detailAddress.province
        });
      }
    });
  }

  changeValueStreet() {
    this.customerEnterpriseForm.get('street').valueChanges.subscribe(val => {
      this.address[0] = val;
      this.customerEnterpriseForm.get('address').patchValue(this.address.join(''))
    });
  }

  changeDataFormEnterprise() {
    this.customerEnterpriseForm.valueChanges.subscribe(value => {
      if ((value.fullName == '' || value.fullName == null) && (value.dateOfBirth == '' || value.dateOfBirth == null) && (value.gender == '' || value.gender == undefined)
        && (value.documentType == '' || value.documentType == undefined) && (value.documentNumber == '' || value.documentNumber == null) && (value.dateRange == '' || value.dateRange == null)
        && (value.placeOfIssue == '' || value.placeOfIssue == null) && (value.city == '' || value.city == undefined) && (value.district == '' || value.district == undefined) && (value.ward == '' || value.ward == undefined)
        && (value.street == '' || value.street == null) && (value.address == '' || value.address == null) && (value.numberPhone == '' || value.numberPhone == null) && (value.email == '' || value.email == null)) {
        this.emitValidAuthorizedPerson.emit(true);
      } else {
        if (this.customerEnterpriseForm.valid) {
          this.emitValidAuthorizedPerson.emit(true)
        } else {
          this.emitValidAuthorizedPerson.emit(false);
        }
      }
    })
  }

  getListOptionDocumentType() {
    this._sharedDirectoryService.getListDocumentTypeByCustomer(CUSTOMER_TYPE.CA_NHAN).subscribe(res => {
      this.listOptionDocumentType = res.data.map(val => {
        return {
          code: val.id,
          value: val.val
        }
      })
    })
  }

  changeDataCity() {
    this.customerEnterpriseForm.get('city').valueChanges.subscribe(val => {
      this.customerEnterpriseForm.controls['district'].reset();
      this.customerEnterpriseForm.controls['ward'].reset();
      if (val) {
        this.address[1] = '';
        this.address[2] = '';
        this.listOptionDistrict = [];
        this.listOptionWard = [];
        this.getListDistrict(val);
        const cityDisplay = this.listOptionCity.filter(city => city.code == val)[0].value;
        this.address[3] = ` - ${cityDisplay}`;
        this.customerEnterpriseForm.get('address').patchValue(this.address.join(''));
      }
    })
  }

  changeDataDistrict() {
    this.customerEnterpriseForm.get('district').valueChanges.subscribe(val => {
      this.customerEnterpriseForm.controls['ward'].reset();
      if (val) {
        this.address[1] = '';
        this.getListWard(val);
        const districtDispaly = this.listOptionDistrict.filter(district => district.code == val)[0].value;
        this.address[2] = ` - ${districtDispaly}`;
        this.customerEnterpriseForm.get('address').patchValue(this.address.join(''));
      }
    })
  }

  changeDataWard() {
    this.customerEnterpriseForm.get('ward').valueChanges.subscribe(val => {
      if (val) {
        const wardDisplay = this.listOptionWard.filter(ward => ward.code == val)[0].value;
        this.address[1] = ` - ${wardDisplay}`;
        this.customerEnterpriseForm.get('address').patchValue(this.address.join(''));
      }
    });
  }

  onKeypressNumberPhone(value) {
    const key = value.key;
    if (!(key >= 0 || key <= 9)) {
      return false;
    }
  }

  getListCity() {
    this._sharedDirectoryService.getListAreas().subscribe(res => {
      this.listOptionCity = res.data.map(val => {
        return {
          code: val.area_code,
          value: val.name
        }
      })
      if (AppStorage.get('cache-customer-authorized')?.city) {
        if (this.firstLoad)
          this.customerEnterpriseForm.get('city').patchValue(AppStorage.get('cache-customer-authorized').city);
      }
    })
  }

  getListDistrict(parentCode) {
    this._sharedDirectoryService.getListAreas(parentCode).subscribe(res => {
      this.listOptionDistrict = res.data.map(val => {
        return {
          code: val.area_code,
          value: val.name
        }
      })
      if (this.detailAddress) {
        this.customerEnterpriseForm.patchValue({
          district: this.detailAddress.district
        })
      }
      if (AppStorage.get('cache-customer-authorized')?.district) {
        if (this.firstLoad)
          this.customerEnterpriseForm.get('district').patchValue(AppStorage.get('cache-customer-authorized').district);
      }
    })
  }

  getListWard(parentCode) {
    this._sharedDirectoryService.getListAreas(parentCode).subscribe(res => {
      this.listOptionWard = res.data.map(val => {
        return {
          code: val.area_code,
          value: val.name
        }
      })
      if (this.detailAddress) {
        this.customerEnterpriseForm.patchValue({
          ward: this.detailAddress.area_code
        })
      }
      if (AppStorage.get('cache-customer-authorized')?.ward) {
        if (this.firstLoad) {
          this.customerEnterpriseForm.get('ward').patchValue(AppStorage.get('cache-customer-authorized').ward);
          this.firstLoad = false;
        }
      }
    })
  }

  cacheFullName() {
    this.cacheDataAuthorized.fullName = this.customerEnterpriseForm.get('fullName').value;
    AppStorage.set('cache-customer-authorized', this.cacheDataAuthorized);
  }

  cacheDOB() {
    this.cacheDataAuthorized.dateOfBirth = this.customerEnterpriseForm.get('dateOfBirth').value;
    AppStorage.set('cache-customer-authorized', this.cacheDataAuthorized);
  }

  cacheGender() {
    this.cacheDataAuthorized.gender = this.customerEnterpriseForm.get('gender').value;
    AppStorage.set('cache-customer-authorized', this.cacheDataAuthorized);
  }

  cacheDocumentType() {
    this.cacheDataAuthorized.documentType = this.customerEnterpriseForm.get('documentType').value;
    AppStorage.set('cache-customer-authorized', this.cacheDataAuthorized);
  }

  cacheDocumentNumber() {
    this.cacheDataAuthorized.documentNumber = this.customerEnterpriseForm.get('documentNumber').value;
    AppStorage.set('cache-customer-authorized', this.cacheDataAuthorized);
  }

  cacheDateRange() {
    this.cacheDataAuthorized.dateRange = this.customerEnterpriseForm.get('dateRange').value;
    AppStorage.set('cache-customer-authorized', this.cacheDataAuthorized);
  }

  cachePlaceOfIssue() {
    this.cacheDataAuthorized.placeOfIssue = this.customerEnterpriseForm.get('placeOfIssue').value;
    AppStorage.set('cache-customer-authorized', this.cacheDataAuthorized);
  }

  cacheCity() {
    this.cacheDataAuthorized.city = this.customerEnterpriseForm.get('city').value;
    AppStorage.set('cache-customer-authorized', this.cacheDataAuthorized);
  }

  cacheDistrict() {
    this.cacheDataAuthorized.district = this.customerEnterpriseForm.get('district').value;
    AppStorage.set('cache-customer-authorized', this.cacheDataAuthorized);
  }

  cacheWard() {
    this.cacheDataAuthorized.ward = this.customerEnterpriseForm.get('ward').value;
    AppStorage.set('cache-customer-authorized', this.cacheDataAuthorized);
  }

  cacheStreet() {
    this.cacheDataAuthorized.street = this.customerEnterpriseForm.get('street').value;
    AppStorage.set('cache-customer-authorized', this.cacheDataAuthorized);
  }

  cacheAddress() {
    this.cacheDataAuthorized.address = this.customerEnterpriseForm.get('address').value;
    AppStorage.set('cache-customer-authorized', this.cacheDataAuthorized);
  }

  cacheNumberPhone() {
    this.cacheDataAuthorized.numberPhone = this.customerEnterpriseForm.get('numberPhone').value;
    AppStorage.set('cache-customer-authorized', this.cacheDataAuthorized);
  }

  cacheEmail() {
    this.cacheDataAuthorized.email = this.customerEnterpriseForm.get('email').value;
    AppStorage.set('cache-customer-authorized', this.cacheDataAuthorized);
  }

  patchValueFormCacheData() {
    if (AppStorage.get('cache-customer-authorized')) {
      this.customerEnterpriseForm.patchValue({
        fullName: AppStorage.get('cache-customer-authorized')?.fullName,
        dateOfBirth: moment(moment(AppStorage.get('cache-customer-authorized')?.dateOfBirth).format(COMMOM_CONFIG.DATE_TIME_FORMAT), COMMOM_CONFIG.DATE_FORMAT).toDate(),
        gender: AppStorage.get('cache-customer-authorized')?.gender,
        documentNumber: AppStorage.get('cache-customer-authorized')?.documentNumber,
        dateRange: moment(moment(AppStorage.get('cache-customer-authorized')?.dateRange).format(COMMOM_CONFIG.DATE_TIME_FORMAT), COMMOM_CONFIG.DATE_FORMAT).toDate(),
        placeOfIssue: AppStorage.get('cache-customer-authorized')?.placeOfIssue,
        street: AppStorage.get('cache-customer-authorized')?.street,
        address: AppStorage.get('cache-customer-authorized')?.address,
        numberPhone: AppStorage.get('cache-customer-authorized')?.numberPhone,
        email: AppStorage.get('cache-customer-authorized')?.email
      })
    }
  }

  ngOnDestroy() {
    this.registerServicesStore.changeDetailCustomerRegister(null);
  }


}
