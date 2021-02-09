import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectOptionModel } from '@app/core/models/common.model';
import { AppStorage } from '@app/core/services/AppStorage';
import { ValidationService } from '@app/shared/common/validation.service';
import { CUSTOMER_TYPE, gender } from '@app/shared/constant/common.constant';
import { PubSubEventService } from '@app/shared/services/pubsub-event.service';
import { SharedDirectoryService } from '@app/shared/services/shared-directory.service';
import { COMMOM_CONFIG } from '@env/environment';
import moment from 'moment';

@Component({
  selector: 'app-customer-information-representative',
  templateUrl: './customer-information-representative.component.html',
  styleUrls: ['./customer-information-representative.component.scss']
})
export class CustomerInformationRepresentativeComponent implements OnInit, OnDestroy {

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
  @Input() infoFromVtPost: any;
  constructor(private fb: FormBuilder,
    private _sharedDirectoryService: SharedDirectoryService,
    private _pubSubEventService: PubSubEventService,
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
    if (AppStorage.getLoginByToken()) {
      this.bindDataVTP()
    }
  }
  bindDataVTP() {
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
    this._pubSubEventService.sub$('CUSTOMER_INFORMATION.DETAIL_CUSTOMER_REGISTER', customer => {
      if (customer) {
        this.detailCustomer = customer;
        this.patchValueForm(customer);
      }
    });
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
