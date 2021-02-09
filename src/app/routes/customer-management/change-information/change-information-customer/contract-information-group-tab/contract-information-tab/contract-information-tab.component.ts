import { Component, OnInit, Input, ViewChild, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MtxDialog } from '@ng-matero/extensions/dialog';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MtxGridColumn } from '@ng-matero/extensions';
import {
  ConfirmDialogModel,
  ConfirmDialogComponent,
} from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { SelectOptionModel } from '@app/core/models/common.model';
import { SharedDirectoryService } from '@app/shared/services/shared-directory.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import moment from 'moment';
import { COMMOM_CONFIG } from '@env/environment';
import { ContractService } from '@app/core/services/contract/contract.service';
import { CommonCRMService } from '@app/shared';
import { MatTable } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import {
  ACTION_TYPE,
  PASSWORD,
  CUSTOMER_TYPE_ID,
  CONNECT_VTP,
  SOURCE_MONEYVTP,
  HTTP_CODE,
} from '@app/shared/constant/common.constant';
import { VehicleService, RESOURCE } from '@app/core';
import { ValidationService } from '@app/shared/common/validation.service';
import { AppStorage } from '@app/core/services/AppStorage';
import { timer } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

class SearchModel {
  msisdn?: string;
  actTypeId?: number;
}

@Component({
  selector: 'app-contract-information-tab',
  templateUrl: './contract-information-tab.component.html',
  styleUrls: ['./contract-information-tab.component.scss'],
})
export class ContractInformationTabComponent extends BaseComponent implements OnInit, OnChanges {
  @ViewChild(MatTable) table: MatTable<any>;
  @Input() contractDetails = {};
  @Input() node: any;
  dataReasonType: any;
  dataFeesType = [];
  checkValidForm = true;
  displayedColumns = ['fee', 'price'];
  accountUserId: any;
  formInfo: FormGroup;
  columnsFee: MtxGridColumn[];
  dataMethodCharges: any;
  showOtp: any;
  isDisableDistrict = true;
  isDisableWard = true;
  listOptionCity: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionDistrict: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionWard: SelectOptionModel[] = [] as SelectOptionModel[];
  dataSourceTree = [];
  balance = 0;
  amount = 0;
  isLock = false;
  show: any;
  buttonName: any = 'Show';
  checkConnectExists = false;
  token: any;
  isDisableddisconnect = true;
  originalOrderId: any = {};
  methodRecharge = [];
  ewallet = [];
  listDocumentType = [];
  sourceConnect: any = {};
  sourceMoneyConnect = ['Viettelpay', 'Mobile Money'];
  buttonNameOtp: any = 'Show';
  isConfirm = false;
  isNotHiddenInforVTP = true;
  countOtp = 0;
  constructor(
    private _vehiclesRFID: VehicleService,
    protected _translate: TranslateService,
    private _commonCRMService: CommonCRMService,
    private _sharedDirectoryService: SharedDirectoryService, // API lấy city/district/ward
    private _contractDetailManager: ContractService,
    public actr: ActivatedRoute,
    public dialog: MtxDialog,
    private fb: FormBuilder,
    private contractDetail: ContractService,
    protected toastr: ToastrService,
    private accountUser: CommonCRMService
  ) {
    super(actr, _contractDetailManager, RESOURCE.CONTRACT);
    this.formInfo = this.fb.group({
      contractNo: [''],
      signDate: [''],
      effDate: [''],
      signName: [''],
      expDate: [''],
      noticeName: [
        '',
        [Validators.required, Validators.maxLength(510), ValidationService.cannotWhiteSpace],
      ],
      tp: ['', Validators.required],
      quanhuyen: ['', Validators.required],
      phuongxa: ['', Validators.required],
      noticeStreet: [
        '',
        [Validators.required, Validators.maxLength(255), ValidationService.cannotWhiteSpace],
      ],
      noticeAreaName: [
        '',
        [Validators.required, Validators.maxLength(510), ValidationService.cannotWhiteSpace],
      ],
      noticePhoneNumber: [
        '',
        [Validators.required, Validators.pattern(COMMOM_CONFIG.NUMBER_PHONE_FORMAT), ValidationService.cannotWhiteSpace],
      ],
      noticeEmail: [
        '',
        [
          Validators.pattern(COMMOM_CONFIG.EMAIL_FORMAT),
          Validators.maxLength(255),
          ValidationService.cannotWhiteSpace,
        ],
      ],
      goicuoc: ['', Validators.required],
      chuky: ['', Validators.required],
      thongbao: [''],
      lydo: ['', Validators.required],
      receiveEmail: [''],
      receiveNotify: [''],
      receiveSMS: [''],
      smsRenew: [''],
      type_acc: [''],
      wallet_name: [''],
      phoneNumber: [''],
      number_acc: [''],
      holder_acc: [''],
      OTP: [''],
      type_papers: [''],
      number_papers: [''],
      default_moneySource: [''],
      chargeOTP: [''],
    });
  }

  ngOnInit() {
    this.bindData();
    this.getReason();
    this.changeValueForm();
    this.getFees(ACTION_TYPE.THAY_DOI_HD);
    this._translate.get('customer-management.formCaculateChangeFee').subscribe(res => {
      this.columnsFee = [
        { i18n: res.feeType, field: 'fee', disabled: true },
        { i18n: res.price, field: 'price', disabled: true },
      ];
    });
    this.methodRecharge = AppStorage.get('method-recharges').listData;
    this.ewallet = AppStorage.get('e-wallet').listData;
  }

  ngOnChanges(change) {
    if (change.node) {
      this.formInfo.controls.lydo.reset();
      this.changeValueForm();
      this.bindData();
      this.getListDocumentTypeByCustomer();
      this.customizeNumber();
      this.getBalance();
    }
  }

  setDisableDisconnectVTP() {
    if (
      this.formInfo.controls.type_acc.value &&
      this.formInfo.controls.wallet_name.value &&
      this.formInfo.controls.number_acc.value &&
      this.formInfo.controls.holder_acc.value &&
      this.formInfo.controls.type_papers.value &&
      this.formInfo.controls.number_papers.value &&
      this.formInfo.controls.default_moneySource.value
    ) {
      this.isDisableddisconnect = false;
    } else {
      this.isDisableddisconnect = true;
    }
  }

  checkSourceMoneyVTP() {
    const param: SearchModel = {};
    if (this.formInfo.controls.phoneNumber.value) {
      param.msisdn = this.formInfo.controls.phoneNumber.value;
    }
    param.actTypeId = CONNECT_VTP.ACTIONTYPE;

    this._commonCRMService.checkSourceMoneyVTP(param).subscribe(res => {
      this.sourceConnect = res.data.moneySources[0].bankCode;
      if (this.sourceConnect == SOURCE_MONEYVTP.VIETTEL_PAY) {
        this.formInfo.get('default_moneySource').setValue(this.sourceMoneyConnect[0]);
      } else if (this.sourceConnect == SOURCE_MONEYVTP.MOBILE_MM) {
        this.formInfo.controls.default_moneySource.setValue(this.sourceMoneyConnect[1]);
      }
    });
  }

  getReason() {
    this._commonCRMService.getReason(ACTION_TYPE.THAY_DOI_HD).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.dataReasonType = res.data;
      }
    });
  }

  getFees(actionTypeId) {
    this._commonCRMService.getFees(actionTypeId).subscribe(res => {
      this.amount = res.data ? res.data.fee : 0;
      const feeType = {
        fee: this._translate.instant('contract.fee_change_title'),
        price: res.data.fee,
      };
      this.dataFeesType.push(feeType);
      const feeTotal = {
        fee: this._translate.instant('contract.total_fee'),
        price: res.data.fee,
      };
      this.dataFeesType.push(feeTotal);
      this.table.renderRows();
    });
  }

  changeValueForm() {
    this.formInfo.valueChanges.subscribe(valForm => {
      this.setDisableDisconnectVTP();
      if (
        this.formInfo.valid &&
        this.formInfo.value.goicuoc != '' &&
        this.formInfo.value.chuky != ''
      ) {
        if (
          this.formInfo.controls.receiveEmail.value ||
          this.formInfo.controls.receiveNotify.value ||
          this.formInfo.controls.receiveSMS.value
        ) {
          this.checkValidForm = false;
        } else {
          this.checkValidForm = true;
        }
      } else {
        this.checkValidForm = true;
      }
    });
  }

  async getDetail() {
    const res = (await this._contractDetailManager.findOne(this.node.contractId, '/customers/contracts').toPromise());
    this.formInfo.patchValue({
      goicuoc: res.data.payCharge,
      chuky: res.data.billCycle,
    });
    if (res.mess.code == HTTP_CODE.SUCCESS) {
      this.formInfo.controls.signDate.setValue(res.data.listData[0].signDate);
      this.formInfo.controls.effDate.setValue(res.data.listData[0].effDate);
      res.data.listData[0].expDate = res.data.listData[0].expDate
        ? moment(res.data.listData[0].expDate, COMMOM_CONFIG.DATE_FORMAT).toDate()
        : '';
      this.dataModel = res.data.listData[0];
      this.accountUserId = this.dataModel.accountUserId;
      this.formInfo.controls.chuky.setValue(this.dataModel.billCycle);
      this.formInfo.controls.goicuoc.setValue(this.dataModel.payCharge);
      this.formInfo.controls.receiveEmail.setValue(
        this.dataModel.emailNotification == 1 ? true : false
      );
      this.formInfo.controls.receiveNotify.setValue(
        this.dataModel.pushNotification == 1 ? true : false
      );
      this.formInfo.controls.receiveSMS.setValue(
        this.dataModel.smsNotification == 1 ? true : false
      );
      this.formInfo.controls.smsRenew.setValue(
        this.dataModel.smsRenew == 1 ? true : false
      );
      this.isLock = this.dataModel.isLock;
    } else {
      this.toastr.error(this._translate.instant(res.mess.description));
    }
  }
  async bindData() {
    await this.getDetail();
    await this.getAddressDetail();
    await this.getListOptionCity();
    await this.getListOptionDistrict();
    await this.getListOptionWard();
  }
  // ghép API city/district/ward
  async getListOptionCity() {
    await this._sharedDirectoryService.getListAreas().subscribe(res => {
      this.listOptionCity = AppStorage.get('list-city').map(val => {
        return {
          code: val.area_code,
          value: val.name,
        };
      });
    });
  }

  async getListOptionDistrict() {
    const quanHuyen = (
      await this._sharedDirectoryService.getListAreas(this.dataModel.city).toPromise()
    ).data;
    this.listOptionDistrict = quanHuyen.map(val => {
      return {
        code: val.area_code,
        value: val.name,
      };
    });
  }

  async getListOptionWard() {
    const phuongXa = (
      await this._sharedDirectoryService.getListAreas(this.dataModel.district).toPromise()
    ).data;
    this.listOptionWard = phuongXa.map(val => {
      return {
        code: val.area_code,
        value: val.name,
      };
    });
  }

  async onChangeCity() {
    await this.getListOptionDistrict();
    this.formInfo.controls.quanhuyen.patchValue('');
    this.formInfo.controls.phuongxa.patchValue('');
    this.mergeAddress(null);
  }

  async onChangeDistrict() {
    await this.getListOptionWard();
    this.mergeAddress(1);
  }

  async onChangeAward() {
    this.mergeAddress(null);
  }

  getBalance() {
    this._vehiclesRFID.getBalance(this.node.custId, this.node.contractId).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.balance = res.data.balance;
      }
    });
  }

  resetPassword() {
    const message = this._translate.instant('common.confirm.resetPassword');

    const dialogData = new ConfirmDialogModel(
      this._translate.instant('common.confirm.title.resetPassword'),
      message
    );

    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.accountUser.resetPassword(this.accountUserId, PASSWORD.RESET_PWD).subscribe(
          rs => {
            if (rs.mess.code == HTTP_CODE.SUCCESS) {
              this.toastr.success(this._translate.instant('common.pass.save.success'));
            } else {
              this.toastr.error(this._translate.instant('common.pass.save.error'));
            }
          },
          error => {
            this.toastr.error(this._translate.instant(error.mess.description));
          }
        );
      }
    });
  }

  lockOrUnLockUser() {
    let message = '',
      titleMessage = '',
      messageSuccess = '',
      messageError = '';
    if (!this.isLock) {
      message = this._translate.instant('common.confirm.lockUser');
      titleMessage = this._translate.instant('common.confirm.title.lockUser');
      messageSuccess = this._translate.instant('common.lockUser.save.success');
      messageError = this._translate.instant('common.lockUser.save.error');
    } else {
      message = this._translate.instant('common.confirm.unlockUser');
      titleMessage = this._translate.instant('common.confirm.title.unlockUser');
      messageSuccess = this._translate.instant('common.unlockUser.save.success');
      messageError = this._translate.instant('common.unlockUser.save.error');
    }
    const dialogData = new ConfirmDialogModel(titleMessage, message);

    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.accountUser.lockOrUnLockUser(this.accountUserId, this.isLock).subscribe(
          rs => {
            if (rs.mess.code == HTTP_CODE.SUCCESS) {
              this.toastr.success(messageSuccess);
              this.isLock = !this.isLock;
            } else {
              this.toastr.error(messageError);
            }
          },
          error => {
            this.toastr.error(this._translate.instant(error.mess.description));
          }
        );
      }
    });
  }
  confirmDialog(value: any): void {
    const message = this._translate.instant('common.confirm.delete');

    const dialogData = new ConfirmDialogModel(
      this._translate.instant('common.confirm.title.delete'),
      message
    );

    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
      }
    });
  }
  viettelPayAccount(record?, componentTemplate?) {
    const contractId = this.node.contractId;
    const customerId = this.node.custId;
    this.dialog.open(
      {
        width: '65%',
        data: { contractId, customerId },
      },
      componentTemplate
    );
  }

  delete(value: any) {
    this.confirmDialog(value);
  }

  onResetForm() {
    this.bindData();
  }

  async getAddressDetail() {
    await this._sharedDirectoryService
      .getAddressByCode(this.dataModel.noticeAreaCode)
      .toPromise()
      .then(res => {
        this.dataMethodCharges = res.data;
        this.dataModel.city = this.dataMethodCharges[0].province;
        this.dataModel.district = this.dataMethodCharges[0].district;
      });
  }

  onSaveContractInfor() {
    if (
      Date.parse(this.formInfo.controls.effDate.value) >=
      Date.parse(this.formInfo.controls.expDate.value)
    ) {
      this.toastr.error(
        this._translate.instant('customer-management.formContractInfo.mess_effErro')
      );
      return;
    }
    const body = {};

    this.confirmDialogUpdate();
  }

  confirmDialogUpdate(): void {
    const message = this._translate.instant('common.confirm.save');
    const dialogData = new ConfirmDialogModel(
      this._translate.instant('common.confirm.title.save'),
      message
    );
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        const expDate = moment(this.dataModel.expDate).format(COMMOM_CONFIG.DATE_TIME_EXPIRE_FORMAT);
        const body = {
          effDate: this.dataModel.effDate ? `${this.dataModel.effDate} 00:00:00` : '',
          expDate: this.dataModel.expDate ? expDate : '',
          emailNotification: this.formInfo.controls.receiveEmail.value ? '1' : '0',
          smsNotification: this.formInfo.controls.receiveSMS.value ? '1' : '0',
          smsRenew: this.formInfo.controls.smsRenew.value ? '1' : '0',
          pushNotification: this.formInfo.controls.receiveNotify.value ? '1' : '0',
          billCycle: this.formInfo.controls.chuky.value,
          signName: this.dataModel.signName,
          noticeStreet: this.dataModel.noticeStreet,
          payCharge: this.formInfo.controls.goicuoc.value,
          noticeName: this.dataModel.noticeName,
          noticeAreaName: this.dataModel.noticeAreaName,
          noticeAreaCode: this.dataModel.noticeAreaCode,
          noticeEmail: this.dataModel.noticeEmail ? this.dataModel.noticeEmail.trim() : '',
          noticePhoneNumber: this.dataModel.noticePhoneNumber
            ? this.dataModel.noticePhoneNumber.trim()
            : '',
          reasonId: this.formInfo.controls.lydo.value,
          actTypeId: ACTION_TYPE.THAY_DOI_HD,
          amount: this.amount,
        };
        this.contractDetail.updateContract(body, this.node.custId, this.node.contractId).subscribe(
          res => {
            if (res.mess.code == HTTP_CODE.SUCCESS) {
              this.toastr.success(this._translate.instant('common.notify.save.success'));
            } else {
              this.toastr.error(this._translate.instant('common.notify.fail'));
            }
          },
          error => {
            this.toastr.error(this._translate.instant(error.mess.description));
          }
        );
      }
    });
  }

  changeStreetNumber(event) {
    this.mergeAddress(null);
  }

  customizeNumber() {
    let randomNumber = (Math.floor(Math.random() * 999999) + 0).toString();
    const lenghtNumber = randomNumber.length;
    if (lenghtNumber < 6) {
      for (let i = 0; i < 6 - lenghtNumber; i++) {
        randomNumber = `0` + randomNumber;
      }
    }
    return randomNumber;
  }

  toggle() {
    this.show = !this.show;
    if (this.show) this.buttonName = 'Hide';
    else this.buttonName = 'Show';
  }

  toggleCharge() {
    this.showOtp = !this.showOtp;
    if (this.showOtp) this.buttonNameOtp = 'Hide';
    else this.buttonNameOtp = 'Show';
  }

  clearInputOtp(event) {
    this.formSearch.controls.OTP.setValue(null);
  }

  clearInputChargeOtp(event) {
    this.formSearch.controls.chargeOTP.setValue(null);
  }

  getListDocumentTypeByCustomer() {
    this._commonCRMService
      .getListDocumentTypeByCustomer(CUSTOMER_TYPE_ID.CA_NHAN_TRONG_NUOC)
      .subscribe(resDocument => {
        if (resDocument.mess.code == HTTP_CODE.SUCCESS) {
          this.listDocumentType = resDocument.data;
          this.connectExistsViettelPay();
        }
      });
  }

  connectExistsViettelPay() {
    this._commonCRMService.connectExistsViettelPay(this.node.contractId).subscribe(
      res => {
        if (res.mess.code == HTTP_CODE.SUCCESS) {
          this.checkConnectExists = true;
          if (res.data) {
            this.formInfo.controls.type_acc.setValue(
              this.methodRecharge.find(x => x.id == res.data.methodRechargeId)?.name
            );
            this.formInfo.controls.wallet_name.setValue(
              this.ewallet.find(x => x.id == res.data.accountBankId)?.name
            );
            this.formInfo.controls.number_acc.setValue(res.data.accountNumber);
            this.formInfo.controls.holder_acc.setValue(res.data.accountOwner);
            this.formInfo.controls.type_papers.setValue(
              this.listDocumentType.find(x => x.code == res.data.documentTypeCode)?.val
            );
            this.formInfo.controls.number_papers.setValue(res.data.documentNo);
            this.formInfo.controls.phoneNumber.setValue(res.data.linkPhone);
            this.token = res.data.token;
          }
          this.checkSourceMoneyVTP();
        } else {
          this.checkConnectExists = false;
        }
      },
      error => {
        this.toastr.error(this._translate.instant(error.mess.description));
      }
    );
  }

  disconnectViettelPay(event) {
    this.confirmDialogDisConnect();
  }

  confirmDialogDisConnect(): void {
    const message = this._translate.instant('common.confirm.title.disconnect');
    const dialogData = new ConfirmDialogModel(
      this._translate.instant('common.confirm.disconnect'),
      message
    );
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: 'auto',
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        const body = {
          orderId:
            `${moment(new Date()).format(COMMOM_CONFIG.DATE_FORMAT_MILISECONDS)}` +
            `${this.customizeNumber()}`,
          contractId: this.node.contractId,
          msisdn: this.formInfo.controls.phoneNumber.value,
          token: this.token,
          actionTypeId: 1,
        };
        this._commonCRMService.disconnectViettelpay(body).subscribe(
          res => {
            if (res.mess.code == HTTP_CODE.SUCCESS) {
              this.originalOrderId = res.data.orderId;
              this.toastr.success(this._translate.instant('common.notify.disconnect.success.otp'));
              this.toggle();
            } else {
              this.toastr.error(this._translate.instant(res.mess.description));
            }
          },
          error => {
            this.toastr.error(this._translate.instant(error.mess.description));
          }
        );
        const timer$ = timer(300000).pipe(
          takeWhile(x => this.isConfirm != true)
        ).subscribe(r => {
          this.isNotHiddenInforVTP = false;
        });
      }
    });
  }

  cancelConfirmDisConnectVTP(event) {
    this.isConfirm = true;
    const bodyConfirm = {
      orderId:
        `${moment(new Date()).format(COMMOM_CONFIG.DATE_FORMAT_MILISECONDS)}` +
        `${this.customizeNumber()}`,
      contractId: this.node.contractId,
      msisdn: this.formInfo.controls.phoneNumber.value,
      otp: this.formInfo.controls.OTP.value,
      originalOrderId: this.originalOrderId,
      actionTypeId: 1,
      token: this.token,
    };
    this._commonCRMService.confirmDisconnectViettelpay(bodyConfirm).subscribe(
      resConfirm => {
        if (resConfirm.mess.code == HTTP_CODE.SUCCESS) {
          this.toastr.success(this._translate.instant('common.notify.disconnect.success'));
          this.checkConnectExists = false;
        } else {
          this.toastr.error(this._translate.instant('common.notify.disconnect.fail'));
        }
      },
      error => {
        this.countOtp++;
        if (this.countOtp > 3) {
          this.formInfo.controls.OTP.disable();
          this.toastr.error(this._translate.instant('common.notify.connect.fail.three'));
          setTimeout(() => {
            window.location.reload();
          }, 4000);
        } else {
          this.formInfo.controls.OTP.setValue(null);
          this.toastr.error(this._translate.instant(error.mess.description));
        }
      }
    );
  }

  changeSourcemoney() {
    this.toggleCharge();
  }

  mergeAddress(type) {
    let districtName = '';
    let wardName = '';
    let provinceName = '';

    if (this.formInfo.controls.tp.value) {
      provinceName = `- ${this.listOptionCity.find(
        x => x.code == this.formInfo.controls.tp.value
      ).value ?? ''}`;
    }
    if (this.formInfo.controls.quanhuyen.value) {
      districtName = `- ${this.listOptionDistrict.find(
        x => x.code == this.formInfo.controls.quanhuyen.value
      ).value ?? ''}`;
    }
    if (this.formInfo.controls.phuongxa.value && !type) {
      wardName = `- ${this.listOptionWard.find(
        x => x.code == this.formInfo.controls.phuongxa.value
      ).value ?? ''}`;
    }
    const address = `${this.formInfo.controls.noticeStreet.value} ${wardName} ${districtName} ${provinceName}`;
    this.formInfo.controls.noticeAreaName.setValue(address);
  }
}
