import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectOptionModel } from '@app/core/models/common.model';
import { AppStorage } from '@app/core/services/AppStorage';
import { CUSTOMER_TYPE, gender, SharedDirectoryService } from '@app/shared';
import { ValidationService } from '@app/shared/common/validation.service';
import { PubSubEventService } from '@app/shared/services/pubsub-event.service';
import { COMMOM_CONFIG } from '@env/environment';
import moment from 'moment';

@Component({
  selector: 'app-customer-information-authorized',
  templateUrl: './customer-information-authorized.component.html',
  styleUrls: ['./customer-information-authorized.component.scss']
})
export class CustomerInformationAuthorizedComponent implements OnInit, OnDestroy {

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
  @Input() infoFromVtPost: any;
  constructor(private fb: FormBuilder,
    private _sharedDirectoryService: SharedDirectoryService,
    private _pubSubEventService: PubSubEventService
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
    if (AppStorage.getLoginByToken()) {
      this.bindDataVTP();
    }
  }
  bindDataVTP() {
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
    this._pubSubEventService.sub$('CUSTOMER_INFORMATION.DETAIL_CUSTOMER_REGISTER', customer => {
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
    })
  }

  ngOnDestroy() {
    this._pubSubEventService.unSubscribe('CUSTOMER_INFORMATION.DETAIL_CUSTOMER_REGISTER');
  }

}
