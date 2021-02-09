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
  selector: 'app-register-customer-representative',
  templateUrl: './register-customer-representative.component.html',
  styleUrls: ['./register-customer-representative.component.scss'],
})
export class RegisterCustomerRepresentativeComponent implements OnInit, OnDestroy {

  customerEnterpriseForm: FormGroup;
  listOptionGender: SelectOptionModel[] = gender;
  listOptionDocumentType: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionCity: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionDistrict: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionWard: SelectOptionModel[] = [] as SelectOptionModel[];
  @Output() emitValidEnterprise = new EventEmitter<boolean>();
  dateNow = new Date();
  maxDOB = new Date(this.dateNow.getFullYear() - 18, this.dateNow.getMonth(), this.dateNow.getDate());
  address = ['', '', '', ''];
  detailCustomer: any;
  detailAddress: any;
  cacheDataRepresentative: CustomerInforModel = {} as CustomerInforModel;
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
    this.changeValueForm();
    this.changeValueStreet();
    this.changeDataWard();
    this.getListCity();
    this.getListOptionDocumentType();
    this.subscribleStore();
    this.bindData();
  }
  bindData() {
    if (AppStorage.getLoginByToken()) {
      this.mapOrderCustomerRegister();
    } else {
      this.patchValueFormCacheData();
      if (AppStorage.get('cache-customer-representative')) {
        this.cacheDataRepresentative = AppStorage.get('cache-customer-representative');
      }
    }
  }
  /**
   * đơn hàng từ vtpost
   */
  mapOrderCustomerRegister() {

    this.customerEnterpriseForm.patchValue({
      fullName: this.infoFromVtPost?.repName,
      dateOfBirth: moment(moment(this.infoFromVtPost?.repBirthDate).format(COMMOM_CONFIG.DATE_TIME_FORMAT), COMMOM_CONFIG.DATE_FORMAT).toDate(),
      gender: this.infoFromVtPost?.repGender,
      documentNumber: this.infoFromVtPost?.repIdentityNumber,
      dateRange: moment(moment(this.infoFromVtPost?.repDateOfIssue).format(COMMOM_CONFIG.DATE_TIME_FORMAT), COMMOM_CONFIG.DATE_FORMAT).toDate(),
      placeOfIssue: this.infoFromVtPost?.repPlaceOfIssue,
      street: this.infoFromVtPost?.repStreet,
      // address: AppStorage.get('cache-customer-representative')?.address,
      numberPhone: this.infoFromVtPost?.repPhoneNumber,
      email: this.infoFromVtPost?.repEmail
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

  changeValueStreet() {
    this.customerEnterpriseForm.get('street').valueChanges.subscribe(val => {
      this.address[0] = val;
      this.customerEnterpriseForm.get('address').patchValue(this.address.join(''))
    });
  }

  getListOptionDocumentType() {
    this._sharedDirectoryService.getListDocumentTypeByCustomer(CUSTOMER_TYPE.CA_NHAN).subscribe(res => {
      this.listOptionDocumentType = res.data.map(val => {
        return {
          code: val.id,
          value: val.val
        }
      })
      if (AppStorage.get('cache-customer-representative')?.documentType) {
        this.customerEnterpriseForm.get('documentType').patchValue(AppStorage.get('cache-customer-representative').documentType)
      }
    })
  }

  changeValueForm() {
    this.customerEnterpriseForm.valueChanges.subscribe(res => {
      this.emitValidEnterprise.emit(this.customerEnterpriseForm.valid);
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
      fullName: formValue.hasOwnProperty('repName') ? formValue.repName : '',
      dateOfBirth: formValue.hasOwnProperty('repBirthDate') ? new Date(formValue.repBirthDate) : null,
      gender: formValue.hasOwnProperty('repGender') ? formValue.repGender : '',
      documentType: formValue.hasOwnProperty('repIdentityTypeId') ? formValue.repIdentityTypeId : '',
      documentNumber: formValue.hasOwnProperty('repIdentityNumber') ? formValue.repIdentityNumber : '',
      dateRange: formValue.hasOwnProperty('repDateOfIssue') ? new Date(formValue.repDateOfIssue) : null,
      placeOfIssue: formValue.hasOwnProperty('repPlaceOfIssue') ? formValue.repPlaceOfIssue : '',
      street: formValue.hasOwnProperty('repStreet') ? formValue.repStreet : '',
      numberPhone: formValue.hasOwnProperty('repPhoneNumber') ? formValue.repPhoneNumber : '',
      email: formValue.hasOwnProperty('repEmail') ? formValue.repEmail : ''
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

  getListCity() {
    this._sharedDirectoryService.getListAreas().subscribe(res => {
      this.listOptionCity = res.data.map(val => {
        return {
          code: val.area_code,
          value: val.name
        }
      })
      if (AppStorage.get('cache-customer-representative')?.city) {
        if (this.firstLoad)
          this.customerEnterpriseForm.get('city').patchValue(AppStorage.get('cache-customer-representative').city);
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
      if (AppStorage.get('cache-customer-representative')?.district) {
        if (this.firstLoad)
          this.customerEnterpriseForm.get('district').patchValue(AppStorage.get('cache-customer-representative').district);
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
      if (AppStorage.get('cache-customer-representative')?.ward) {
        if(this.firstLoad) {
         this.customerEnterpriseForm.get('ward').patchValue(AppStorage.get('cache-customer-representative').ward);
         this.firstLoad = false;
        }
      }
    })
  }

  cacheFullName() {
    this.cacheDataRepresentative.fullName = this.customerEnterpriseForm.get('fullName').value;
    AppStorage.set('cache-customer-representative', this.cacheDataRepresentative);
  }

  cacheDOB() {
    this.cacheDataRepresentative.dateOfBirth = this.customerEnterpriseForm.get('dateOfBirth').value;
    AppStorage.set('cache-customer-representative', this.cacheDataRepresentative);
  }

  cacheGender() {
    this.cacheDataRepresentative.gender = this.customerEnterpriseForm.get('gender').value;
    AppStorage.set('cache-customer-representative', this.cacheDataRepresentative);
  }

  cacheDocumentType() {
    this.cacheDataRepresentative.documentType = this.customerEnterpriseForm.get('documentType').value;
    AppStorage.set('cache-customer-representative', this.cacheDataRepresentative);
  }

  cacheDocumentNumber() {
    this.cacheDataRepresentative.documentNumber = this.customerEnterpriseForm.get('documentNumber').value;
    AppStorage.set('cache-customer-representative', this.cacheDataRepresentative);
  }

  cacheDateRange() {
    this.cacheDataRepresentative.dateRange = this.customerEnterpriseForm.get('dateRange').value;
    AppStorage.set('cache-customer-representative', this.cacheDataRepresentative);
  }

  cachePlaceOfIssue() {
    this.cacheDataRepresentative.placeOfIssue = this.customerEnterpriseForm.get('placeOfIssue').value;
    AppStorage.set('cache-customer-representative', this.cacheDataRepresentative);
  }

  cacheCity() {
    this.cacheDataRepresentative.city = this.customerEnterpriseForm.get('city').value;
    AppStorage.set('cache-customer-representative', this.cacheDataRepresentative);
  }

  cacheDistrict() {
    this.cacheDataRepresentative.district = this.customerEnterpriseForm.get('district').value;
    AppStorage.set('cache-customer-representative', this.cacheDataRepresentative);
  }

  cacheWard() {
    this.cacheDataRepresentative.ward = this.customerEnterpriseForm.get('ward').value;
    AppStorage.set('cache-customer-representative', this.cacheDataRepresentative);
  }

  cacheStreet() {
    this.cacheDataRepresentative.street = this.customerEnterpriseForm.get('street').value;
    AppStorage.set('cache-customer-representative', this.cacheDataRepresentative);
  }

  cacheAddress() {
    this.cacheDataRepresentative.address = this.customerEnterpriseForm.get('address').value;
    AppStorage.set('cache-customer-representative', this.cacheDataRepresentative);
  }

  cacheNumberPhone() {
    this.cacheDataRepresentative.numberPhone = this.customerEnterpriseForm.get('numberPhone').value;
    AppStorage.set('cache-customer-representative', this.cacheDataRepresentative);
  }

  cacheEmail() {
    this.cacheDataRepresentative.email = this.customerEnterpriseForm.get('email').value;
    AppStorage.set('cache-customer-representative', this.cacheDataRepresentative);
  }

  patchValueFormCacheData() {
    if (AppStorage.get('cache-customer-representative')) {
      this.customerEnterpriseForm.patchValue({
        fullName: AppStorage.get('cache-customer-representative')?.fullName,
        dateOfBirth: moment(moment(AppStorage.get('cache-customer-representative')?.dateOfBirth).format(COMMOM_CONFIG.DATE_TIME_FORMAT), COMMOM_CONFIG.DATE_FORMAT).toDate(),
        gender: AppStorage.get('cache-customer-representative')?.gender,
        documentNumber: AppStorage.get('cache-customer-representative')?.documentNumber,
        dateRange: moment(moment(AppStorage.get('cache-customer-representative')?.dateRange).format(COMMOM_CONFIG.DATE_TIME_FORMAT), COMMOM_CONFIG.DATE_FORMAT).toDate(),
        placeOfIssue: AppStorage.get('cache-customer-representative')?.placeOfIssue,
        street: AppStorage.get('cache-customer-representative')?.street,
        address: AppStorage.get('cache-customer-representative')?.address,
        numberPhone: AppStorage.get('cache-customer-representative')?.numberPhone,
        email: AppStorage.get('cache-customer-representative')?.email
      })
    }
  }

  ngOnDestroy() {
    this.registerServicesStore.changeDetailCustomerRegister(null);
  }
}
