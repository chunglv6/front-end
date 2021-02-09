import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core/app-config';
import { SelectOptionModel } from '@app/core/models/common.model';
import { CustomerService } from '@app/core/services';
import { ValidationService } from '@app/shared/common/validation.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { ACTION_TYPE, CUSTOMER_TYPE, gender, HTTP_CODE } from '@app/shared/constant/common.constant';
import { CommonCRMService } from '@app/shared/services/common-crm.service';
import { SharedDirectoryService } from '@app/shared/services/shared-directory.service';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog, MtxGridColumn } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { AuthorizedComponent } from './authorized/authorized.component';
import { RepresentativeComponent } from './representative/representative.component';

@Component({
  selector: 'app-customer-information-tab',
  templateUrl: './customer-information-tab.component.html',
  styleUrls: ['./customer-information-tab.component.scss']
})
export class CustomerInformationTabComponent extends BaseComponent implements OnInit, OnChanges {

  @Input() node: any;
  inforCustomerForm: FormGroup;
  listOptionCity: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionDistrict: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionWard: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionCustomerType: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionDocumentType: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionGender: SelectOptionModel[] = gender;
  listOptionReason: SelectOptionModel[] = [] as SelectOptionModel[];
  @ViewChild('representative') dataRepresentativeForm: RepresentativeComponent;
  @ViewChild('authorized') dataAuthorizedForm: AuthorizedComponent;
  columnsFee: MtxGridColumn[];
  displayedColumnsFee = ['fee', 'price'];
  feeChangeInfo = 0;
  dateNow = new Date();
  maxDOB = new Date(this.dateNow.getFullYear() - 18, this.dateNow.getMonth(), this.dateNow.getDate());

  detailCustomer: any;
  detailAddress: any;
  customerTypeId = 1;
  checkValidFormCustomer = true;
  checkValidFormRep = true;
  checkValidFormAuthor = true;
  listDataTotal = [];
  @ViewChild('tableFee') tableFee: MatTable<any>;
  address = ['', '', '', ''];
  checkValidDOB = false;

  constructor(private fb: FormBuilder,
    public actr: ActivatedRoute,
    protected translateService: TranslateService,
    private _customerService: CustomerService,
    private _commonCRMService: CommonCRMService,
    private _sharedDirectoryService: SharedDirectoryService,
    protected toastr?: ToastrService,
    public dialog?: MtxDialog) {
    super(actr, null, RESOURCE.CUSTOMER);
  }

  ngOnInit() {
    this.buildForm();
    this.buildColumns();
    this.getReason();
    this.getListCity();
    this.dataChangeCustomerType();
    this.dataFormChange();
    this.getFees(ACTION_TYPE.THAY_DOI_KH);
    this.dataChangeWard();
    this.dataChangeStreet();
    this.setDisable();
    this.dataChangeBirthDay();
  }

  ngOnChanges(change) {
    if (this.inforCustomerForm) {
      this.inforCustomerForm.get('reason').reset();
    }
    if (change.node) {
      this.getDetailCustomer(this.node.custId);
    }
  }

  buildForm() {
    this.inforCustomerForm = this.fb.group({
      customerType: ['', Validators.required],
      customerCode: ['', Validators.required],
      fullName: ['', [Validators.required, Validators.maxLength(510), ValidationService.cannotWhiteSpace]],
      dateOfBirth: [null],
      gender: [''],
      genderName: [],
      documentType: [''],
      documentName: [''],
      documentNumber: ['', Validators.required],
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
      numberPhone: ['', [Validators.required, Validators.pattern(COMMOM_CONFIG.NUMBER_PHONE_FORMAT), ValidationService.cannotWhiteSpace]],
      email: ['', [Validators.pattern(COMMOM_CONFIG.EMAIL_FORMAT), Validators.maxLength(255), ValidationService.cannotWhiteSpace]],
      reason: ['', Validators.required],
      companyName: [''],
      taxNo: [''],
      foundingDate: ['']
    });
  }

  setDisable() {
    this.inforCustomerForm.controls.customerType.disable();
    this.inforCustomerForm.controls.customerCode.disable();
  }

  buildColumns() {
    this.translateService.get('customer-management.formCaculateChangeFee').subscribe(res => {
      this.columnsFee = [
        { i18n: res.feeType, field: 'fee', disabled: true },
        { i18n: res.price, field: 'price', disabled: true },
      ];
    });
  }

  getReason() {
    this._commonCRMService.getReason(ACTION_TYPE.THAY_DOI_KH).subscribe(res => {
      this.listOptionReason = res.data.map(val => {
        return {
          code: val.id,
          value: val.name
        };
      });
    });
  }

  dataChangeBirthDay() {
    this.inforCustomerForm.get('dateOfBirth').valueChanges.subscribe(val => {
      if (val) {
        if (val > this.maxDOB) {
          this.checkValidDOB = true;
        } else {
          this.checkValidDOB = false;
        }
      }
    });
  }

  dataChangeCity(val) {
    this.inforCustomerForm.get('district').patchValue('');
    this.inforCustomerForm.get('ward').patchValue('');
    this.getListDistrict(val, false);
    this.listOptionWard = [];
    this.patchValueAddress();
  }

  dataChangeDistrict(val) {
    this.inforCustomerForm.get('ward').patchValue('');
    this.getListWard(val, false);
    this.patchValueAddress();
  }

  dataChangeWard() {
    this.inforCustomerForm.get('ward').valueChanges.subscribe(val => {
      this.patchValueAddress();
    });
  }

  dataChangeStreet() {
    this.inforCustomerForm.get('street').valueChanges.subscribe(val => {
      this.address[0] = val;
      this.patchValueAddress();
    });
  }

  validFormRepresentative(value) {
    this.checkValidFormRep = value;
    if (this.inforCustomerForm.valid && value && this.checkValidFormAuthor) {
      this.checkValidFormCustomer = false;
    } else {
      this.checkValidFormCustomer = true;
    }
  }

  validFromAuthorized(value) {
    this.checkValidFormAuthor = value;
    if (this.inforCustomerForm.valid && this.checkValidFormRep && value) {
      this.checkValidFormCustomer = false;
    } else {
      this.checkValidFormCustomer = true;
    }
  }

  dataFormChange() {
    this.inforCustomerForm.valueChanges.subscribe(val => {
      if (val) {
        if (this.customerTypeId == CUSTOMER_TYPE.CA_NHAN) {
          if (this.inforCustomerForm.valid) {
            this.checkValidFormCustomer = false;
          } else {
            this.checkValidFormCustomer = true;
          }
        } else {
          if (this.inforCustomerForm.valid && this.checkValidFormRep && this.checkValidFormAuthor) {
            this.checkValidFormCustomer = false;
          } else {
            this.checkValidFormCustomer = true;
          }
        }
      }
    });
  }

  dataChangeCustomerType() {
    this.inforCustomerForm.get('customerType').valueChanges.subscribe(val => {
      if (val) {
        this.setValidate();
      }
    });
  }

  setValidate() {
    if (this.customerTypeId == CUSTOMER_TYPE.CA_NHAN) {
      this.inforCustomerForm.controls.fullName.setValidators([Validators.required, Validators.maxLength(510), ValidationService.cannotWhiteSpace]);
      this.inforCustomerForm.controls.fullName.updateValueAndValidity();
      this.inforCustomerForm.controls.dateOfBirth.setValidators(Validators.required);
      this.inforCustomerForm.controls.dateOfBirth.updateValueAndValidity();
      this.inforCustomerForm.controls.gender.clearValidators();
      this.inforCustomerForm.controls.gender.updateValueAndValidity();
      this.inforCustomerForm.controls.companyName.clearValidators();
      this.inforCustomerForm.controls.companyName.updateValueAndValidity();
      this.inforCustomerForm.controls.taxNo.clearValidators();
      this.inforCustomerForm.controls.taxNo.updateValueAndValidity();
      this.inforCustomerForm.controls.foundingDate.clearValidators();
      this.inforCustomerForm.controls.foundingDate.updateValueAndValidity();
    } else {
      this.inforCustomerForm.controls.companyName.setValidators([Validators.required, Validators.maxLength(510), ValidationService.cannotWhiteSpace]);
      this.inforCustomerForm.controls.companyName.updateValueAndValidity();
      this.inforCustomerForm.controls.taxNo.setValidators(Validators.required);
      this.inforCustomerForm.controls.taxNo.updateValueAndValidity();
      this.inforCustomerForm.controls.foundingDate.setValidators(Validators.required);
      this.inforCustomerForm.controls.foundingDate.updateValueAndValidity();
      this.inforCustomerForm.controls.fullName.clearValidators();
      this.inforCustomerForm.controls.fullName.updateValueAndValidity();
      this.inforCustomerForm.controls.dateOfBirth.clearValidators();
      this.inforCustomerForm.controls.dateOfBirth.updateValueAndValidity();
      this.inforCustomerForm.controls.gender.clearValidators();
      this.inforCustomerForm.controls.gender.updateValueAndValidity();
    }
  }

  patchValueForm(formValue) {
    this.inforCustomerForm.patchValue({
      customerCode: formValue.custId,
      companyName: formValue.custName,
      taxNo: formValue.taxCode,
      foundingDate: moment(formValue.birthDate, COMMOM_CONFIG.DATE_FORMAT).toDate(),
      documentNumber: formValue.documentNumber,
      dateRange: moment(formValue.dateOfIssue, COMMOM_CONFIG.DATE_FORMAT).toDate(),
      placeOfIssue: formValue.placeOfIssue,
      street: formValue.street,
      address: formValue.areaName,
      numberPhone: formValue.phoneNumber,
      email: formValue.email,
      fullName: formValue.custName,
      dateOfBirth: moment(formValue.birthDate, COMMOM_CONFIG.DATE_FORMAT).toDate(),
      gender: formValue.gender,
      documentName: formValue.documentTypeName
    });
  }

  getDetailCustomer(customerId) {
    this._customerService.getDetailCustomer(customerId).subscribe(res => {
      this.detailCustomer = res;
      this.customerTypeId = this.detailCustomer.data.listData[0].type;
      this.setValidate();
      this.getListDocumentTypeByCustomer(this.customerTypeId);
      this.getListCustomerType();
      this.patchValueForm(this.detailCustomer.data.listData[0]);
      this.getAddressDetail(this.detailCustomer.data.listData[0].areaCode);
    });
  }

  getAddressDetail(areaCode) {
    this._sharedDirectoryService.getAddressByCode(areaCode).subscribe(res => {
      if (res.data.length > 0) {
        this.detailAddress = res;
        this.getListDistrict(this.detailAddress.data[0].province, true);
        this.getListWard(this.detailAddress.data[0].district, true);
      }
    });
  }

  getFees(actionTypeId) {
    this._commonCRMService.getFees(actionTypeId).subscribe(res => {
      if (res.data != undefined) {
        this.feeChangeInfo = res.data.fee;
        const fee = {
          fee: this.translateService.instant('common.fee-change-customer'),
          price: res.data.fee
        };
        this.listDataTotal.push(fee);
        const total = {
          fee: this.translateService.instant('common.total'),
          price: res.data.fee
        };
        this.listDataTotal.push(total);
        this.tableFee.renderRows();
      }
    });
  }

  getListCustomerType() {
    this._sharedDirectoryService.getListCustomerType().subscribe(res => {
      this.listOptionCustomerType = res.data.map(val => {
        return {
          id: val.type,
          code: val.cust_type_id,
          value: val.name
        };
      });
      const findCustType = this.listOptionCustomerType.find(x => x.code == this.detailCustomer.data.listData[0].custTypeId);
      if (findCustType) {
        this.inforCustomerForm.get('customerType').patchValue(findCustType.value);
      }

    });
  }

  getListDocumentTypeByCustomer(customerTypeId) {
    this._sharedDirectoryService.getListDocumentTypeByCustomer(customerTypeId).subscribe(res => {
      this.listOptionDocumentType = res.data.map(val => {
        return {
          code: val.id,
          value: val.val
        };
      });
      const findDocType = this.listOptionDocumentType.find(x => x.code == this.detailCustomer.data.listData[0].documentTypeId);
      if (findDocType) {
        this.inforCustomerForm.get('documentType').patchValue(findDocType.code);
        // this.inforCustomerForm.get('documentName').patchValue(findDocType.value);
      }
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

  getListDistrict(parentCode, isPatchValue) {
    this._sharedDirectoryService.getListAreas(parentCode).subscribe(res => {
      this.listOptionDistrict = res.data.map(val => {
        return {
          code: val.area_code,
          value: val.name
        };
      });
      if (isPatchValue) {
        this.inforCustomerForm.patchValue({
          district: this.detailAddress.data[0].district,
          city: this.detailAddress.data[0].province
        });
      }
    });
  }

  getListWard(parentCode, isPatchValue) {
    this._sharedDirectoryService.getListAreas(parentCode).subscribe(res => {
      this.listOptionWard = res.data.map(val => {
        return {
          code: val.area_code,
          value: val.name
        };
      });
      if (isPatchValue) {
        this.inforCustomerForm.patchValue({
          ward: this.detailCustomer.data.listData[0].areaCode
        });
      }
    });
  }

  patchValueAddress() {
    const findCity = this.listOptionCity.find(x => x.code == this.inforCustomerForm.get('city').value);
    this.address[3] = findCity ? ` - ${findCity.value}` : '';
    const findDictrict = this.listOptionDistrict.find(x => x.code == this.inforCustomerForm.get('district').value);
    this.address[2] = findDictrict ? ` - ${findDictrict.value}` : '';
    const findWard = this.listOptionWard.find(x => x.code == this.inforCustomerForm.get('ward').value);
    this.address[1] = findWard ? ` - ${findWard.value}` : '';
    this.inforCustomerForm.get('address').patchValue(this.address.join(''));
  }

  onKeypressNumberPhone(value) {
    const key = value.key;
    if (!(key >= 0 || key <= 9)) {
      return false;
    }
  }

  onResetForm() {
    this.getDetailCustomer(this.node.custId);
    this.inforCustomerForm.get('reason').reset();
  }

  confirmDialog(): void {
    const message = this.translateService.instant('common.confirm.update');
    const dialogData = new ConfirmDialogModel(this.translateService.instant('common.confirm.title.update'), message);
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        if (this.customerTypeId == CUSTOMER_TYPE.CA_NHAN) {
          const body: any = {
            actTypeId: ACTION_TYPE.THAY_DOI_KH,
            areaCode: this.inforCustomerForm.value.ward,
            areaName: this.inforCustomerForm.value.address ? this.inforCustomerForm.value.address.trim() : '',
            birthDate: moment(this.inforCustomerForm.value.dateOfBirth).format(COMMOM_CONFIG.DATE_TIME_FORMAT),
            custId: this.inforCustomerForm.value.customerCode,
            custName: this.inforCustomerForm.value.fullName ? this.inforCustomerForm.value.fullName.trim() : '',
            custTypeId: this.customerTypeId,
            dateOfIssue: moment(this.inforCustomerForm.value.dateRange).format(COMMOM_CONFIG.DATE_TIME_FORMAT),
            documentNumber: this.inforCustomerForm.value.documentNumber ? this.inforCustomerForm.value.documentNumber.trim() : '',
            documentTypeId: this.inforCustomerForm.value.documentType,
            email: this.inforCustomerForm.value.email ? this.inforCustomerForm.value.email.trim() : '',
            gender: this.inforCustomerForm.value.gender,
            phoneNumber: this.inforCustomerForm.value.numberPhone ? this.inforCustomerForm.value.numberPhone.trim() : '',
            placeOfIssue: this.inforCustomerForm.value.placeOfIssue ? this.inforCustomerForm.value.placeOfIssue.trim() : '',
            price: this.feeChangeInfo,
            amount: this.feeChangeInfo,
            reasonId: this.inforCustomerForm.value.reason,
            street: this.inforCustomerForm.value.street ? this.inforCustomerForm.value.street.trim() : ''
          };
          this._customerService.updateCustomerPersonal(this.node.custId, body).subscribe(res => {
            if (res.mess.code == HTTP_CODE.SUCCESS) {
              this.toastr.success(this.translateService.instant('common.notify.update-customer'));
            } else {
              this.toastr.warning(res.mess.description);
            }
          }, err => {
            this.toastr.error(this.translateService.instant('common.500Error'));
          });
        } else {
          let authBirthDate = null;
          if (this.dataAuthorizedForm.customerEnterpriseForm.value.dateOfBirth) {
            authBirthDate = moment(this.dataAuthorizedForm.customerEnterpriseForm.value.dateOfBirth).format(COMMOM_CONFIG.DATE_TIME_FORMAT);
          }
          let authDateOfIssue = null;
          if (this.dataAuthorizedForm.customerEnterpriseForm.value.dateRange) {
            authDateOfIssue = moment(this.dataAuthorizedForm.customerEnterpriseForm.value.dateRange).format(COMMOM_CONFIG.DATE_TIME_FORMAT);
          }
          const body = {
            actTypeId: ACTION_TYPE.THAY_DOI_KH,
            areaCode: this.inforCustomerForm.value.ward,
            areaName: this.inforCustomerForm.value.address ? this.inforCustomerForm.value.address.trim() : '',
            authAreaCode: this.dataAuthorizedForm.customerEnterpriseForm.value.ward,
            authAreaName: this.dataAuthorizedForm.customerEnterpriseForm.value.address ? this.dataAuthorizedForm.customerEnterpriseForm.value.address.trim() : '',
            authBirthDate,
            authDateOfIssue,
            authEmail: this.dataAuthorizedForm.customerEnterpriseForm.value.email ? this.dataAuthorizedForm.customerEnterpriseForm.value.email.trim() : '',
            authGender: this.dataAuthorizedForm.customerEnterpriseForm.value.gender,
            authIdentityNumber: this.dataAuthorizedForm.customerEnterpriseForm.value.documentNumber ? this.dataAuthorizedForm.customerEnterpriseForm.value.documentNumber.trim() : '',
            authIdentityTypeId: this.dataAuthorizedForm.customerEnterpriseForm.value.documentType,
            authName: this.dataAuthorizedForm.customerEnterpriseForm.value.fullName ? this.dataAuthorizedForm.customerEnterpriseForm.value.fullName.trim() : '',
            authPhoneNumber: this.dataAuthorizedForm.customerEnterpriseForm.value.numberPhone ? this.dataAuthorizedForm.customerEnterpriseForm.value.numberPhone.trim() : '',
            authPlaceOfIssue: this.dataAuthorizedForm.customerEnterpriseForm.value.placeOfIssue ? this.dataAuthorizedForm.customerEnterpriseForm.value.placeOfIssue.trim() : '',
            authStreet: this.dataAuthorizedForm.customerEnterpriseForm.value.street ? this.dataAuthorizedForm.customerEnterpriseForm.value.street.trim() : '',
            birthDate: moment(this.inforCustomerForm.value.foundingDate).format(COMMOM_CONFIG.DATE_TIME_FORMAT),
            custId: this.inforCustomerForm.value.customerCode,
            custName: this.inforCustomerForm.value.companyName ? this.inforCustomerForm.value.companyName.trim() : '',
            custTypeId: this.customerTypeId,
            dateOfIssue: moment(this.inforCustomerForm.value.dateRange).format(COMMOM_CONFIG.DATE_TIME_FORMAT),
            documentNumber: this.inforCustomerForm.value.documentNumber ? this.inforCustomerForm.value.documentNumber.trim() : '',
            documentTypeId: this.inforCustomerForm.value.documentType,
            email: this.inforCustomerForm.value.email ? this.inforCustomerForm.value.email.trim() : '',
            phoneNumber: this.inforCustomerForm.value.numberPhone ? this.inforCustomerForm.value.numberPhone.trim() : '',
            placeOfIssue: this.inforCustomerForm.value.placeOfIssue ? this.inforCustomerForm.value.placeOfIssue.trim() : '',
            price: this.feeChangeInfo,
            amount: this.feeChangeInfo,
            reasonId: this.inforCustomerForm.value.reason,
            repAreaCode: this.dataRepresentativeForm.customerEnterpriseForm.value.ward,
            repAreaName: this.dataRepresentativeForm.customerEnterpriseForm.value.address ? this.dataRepresentativeForm.customerEnterpriseForm.value.address.trim() : '',
            repBirthDate: moment(this.dataRepresentativeForm.customerEnterpriseForm.value.dateOfBirth).format(COMMOM_CONFIG.DATE_TIME_FORMAT),
            repDateOfIssue: moment(this.dataRepresentativeForm.customerEnterpriseForm.value.dateRange).format(COMMOM_CONFIG.DATE_TIME_FORMAT),
            repEmail: this.dataRepresentativeForm.customerEnterpriseForm.value.email ? this.dataRepresentativeForm.customerEnterpriseForm.value.email.trim() : '',
            repGender: this.dataRepresentativeForm.customerEnterpriseForm.value.gender,
            repIdentityNumber: this.dataRepresentativeForm.customerEnterpriseForm.value.documentNumber ? this.dataRepresentativeForm.customerEnterpriseForm.value.documentNumber.trim() : '',
            repIdentityTypeId: this.dataRepresentativeForm.customerEnterpriseForm.value.documentType,
            repName: this.dataRepresentativeForm.customerEnterpriseForm.value.fullName ? this.dataRepresentativeForm.customerEnterpriseForm.value.fullName.trim() : '',
            repPhoneNumber: this.dataRepresentativeForm.customerEnterpriseForm.value.numberPhone ? this.dataRepresentativeForm.customerEnterpriseForm.value.numberPhone.trim() : '',
            repPlaceOfIssue: this.dataRepresentativeForm.customerEnterpriseForm.value.placeOfIssue ? this.dataRepresentativeForm.customerEnterpriseForm.value.placeOfIssue.trim() : '',
            repStreet: this.dataRepresentativeForm.customerEnterpriseForm.value.street ? this.dataRepresentativeForm.customerEnterpriseForm.value.street.trim() : '',
            street: this.inforCustomerForm.value.street ? this.inforCustomerForm.value.street.trim() : '',
            taxCode: this.inforCustomerForm.value.taxNo ? this.inforCustomerForm.value.taxNo.trim() : ''
          };
          this._customerService.updateCustomerEnterprise(this.node.custId, body).subscribe(res => {
            if (res.mess.code == HTTP_CODE.SUCCESS) {
              this.toastr.success(this.translateService.instant('common.notify.update-customer'));
            } else {
              this.toastr.warning(res.mess.description);
            }
          }, err => {
            this.toastr.error(this.translateService.instant('common.500Error'));
          });
        }
      }
    });
  }

  onUpdateCustomer() {
    this.confirmDialog();
  }

}
