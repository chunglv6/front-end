import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ContractService, RESOURCE, VehicleService } from '@app/core';
import { PromotionService } from '@app/core/services/policy/promotion.service';
import { CommonCRMService, HTTP_CODE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { CommonListComponent } from '@app/shared/components/common-list/common-list.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, tap } from 'rxjs/operators';

@Component({
  selector: 'app-account-recharge',
  templateUrl: './account-recharge.component.html',
  styleUrls: ['./account-recharge.component.scss']
})
export class AccountRechargeComponent extends BaseComponent implements OnInit {

  constructor(
    public actr: ActivatedRoute,
    private _crmService: CommonCRMService,
    private fb: FormBuilder,
    private _contractInfoService: ContractService,
    private _vehiclesRFID: VehicleService,
    protected _translateService?: TranslateService,
    protected toastr?: ToastrService,
    protected _promotionService?: PromotionService,
  ) {
    super(actr, _crmService, RESOURCE.CUSTOMER);
    this.formRecharge = this.fb.group({
      contractNumber: ['', Validators.required],
      customerName: [''],
      customerPhone: [''],
      customerAccount: [''],
      customerMoney: [''],
      customerUser: ['', Validators.required],
      customerDay: ['', Validators.required],
      customerEmployee: ['', Validators.required]
    });
  }
  formRecharge: FormGroup;
  isLoadingAuto: boolean;
  selectedContract: any = {};
  states = [];
  accountRecharge = [];
  @ViewChild('accountRechargeHistory') accountRechargeHistory: CommonListComponent;
  balance: number;
  addressCustomer: string;
  topupEtcId: number;
  address: string;
  booAddress: string;
  thumbnail: any;
  filteredStates = this.states;

  ngOnInit() {
    this.columns = [
      {
        i18n: 'account-recharge.orderNumber',
        field: 'orderNumber',
        disabled: true,
        type: 'order'
      },
      {
        i18n: 'account-recharge.money',
        field: 'amount',
        disabled: true,
        type: 'currency',
      },
      {
        i18n: 'account-recharge.day',
        field: 'topupDate',
        disabled: true,
        type: 'datetime',
      },
      {
        i18n: 'account-recharge.user',
        field: 'topupPayer',
        disabled: true,
      },
      {
        i18n: 'account-recharge.surplus-before',
        field: 'balanceBefore',
        disabled: true,
        type: 'currency',
      },
      {
        i18n: 'account-recharge.surplus-after',
        field: 'balanceAfter',
        disabled: true,
        type: 'currency',
      },
      {
        i18n: 'account-recharge.employee',
        field: 'staffName',
        disabled: true,
      },
      {
        i18n: 'account-recharge.show',
        field: 'show',
        disabled: true,
        type: 'custom',
      },
    ];
    super.mapColumn();
    this.formRecharge.get('contractNumber').valueChanges.pipe(debounceTime(1000), tap(() => { this.isLoadingAuto = true; this.filteredStates = []; })).subscribe(value => {
      if (typeof value !== 'object') {
        this._contractInfoService.searchContractInfo(value.trim()).subscribe(rs => {
          this.isLoadingAuto = false;
          this.filteredStates = rs.data.listData;
        });
      }
    });
  }

  onSelectedCustomer(event) {
    this.selectedContract = event.option.value;
    this.selectedContract.signDate = this.selectedContract.signDate ? this.selectedContract.signDate.split(' ')[0] : null;
    this.selectedContract.effDate = this.selectedContract.effDate ? this.selectedContract.effDate.split(' ')[0] : null;
    this.selectedContract.expDate = this.selectedContract.expDate ? this.selectedContract.expDate.split(' ')[0] : null;
    this.getBalance(this.selectedContract.custId, this.selectedContract.contractId);
    this.getListCashHistory();
    this.formRecharge.controls.customerMoney.setValue(null);
    this.formRecharge.controls.customerUser.setValue(null);
    this.formRecharge.controls.customerDay.setValue(null);
  }

  getOptionText(option) {
    if (option) {
      return option.contractNo;
    }
  }

  async filter(value: any) {
    if (typeof value === 'object') return;
    const data = (
      await this._contractInfoService.searchContractInfo(value.trim())
        .toPromise()
    ).data;
    if (data.listData.length > 0) {
      this.filteredStates.push(data.listData[0]);
    }
    return this.filteredStates;
  }

  getHeight() {
    if (this.accountRecharge) {
      if (this.accountRecharge.length > 5) {
        return '300px';
      } else {
        return 'fit-content';
      }
    }
  }

  getBalance(custId, contractId) {
    this._vehiclesRFID.getBalance(custId, contractId).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.balance = res.data.balance;
        this.formRecharge.controls.customerName.setValue(res.data.noticeName);
        this.formRecharge.controls.customerPhone.setValue(res.data.noticePhoneNumber);
        this.formRecharge.controls.customerEmployee.setValue(res.data.createUser);
        this.addressCustomer = res.data.noticeAreaName;
      }
    });
  }

  topUpETC() {
    const body = {
      address: this.addressCustomer ? this.addressCustomer.trim() : '',
      customerName: this.formRecharge.controls.customerName.value.trim(),
      stockModelCode: 'TOP',
      price: this.formRecharge.controls.customerMoney.value ? Number(this.formRecharge.controls.customerMoney.value) : 0,
      vat: 0,
      quantity: 1,
      transType: '2',
      saleTransType: '51',
      contractId: this.selectedContract.contractId ? Number(this.selectedContract.contractId) : 0,
      balanceBefore: this.balance ? Number(this.balance) : 0,
    };
    this._crmService.topUpETC(body).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.toastr.success(this._translateService.instant('account-recharge.topup-success'));
        this.accountRechargeHistory.renderTable();
      } else {
        this.toastr.error(res.mess.description);
      }
    }, error => {
      this.toastr.error(error.mess.description);
    });
  }

  getViewContract(row) {
    const body = {
      topupEtcId: row.topupEtcId,
      address: this.addressCustomer,
      booAddress: 'Số 1 Trần Hữu Dực'
    };
    this._crmService.getSprintContract(body).subscribe(res => { });
  }

  getSprintContract(row) {
    const body = {
      topupEtcId: row.topupEtcId,
      address: this.addressCustomer,
      booAddress: 'Số 1 Trần Hữu Dực'
    };
    this._crmService.getSprintContract(body).subscribe(res => {
      const contentDisposition = res.headers.get('content-disposition');
      const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
      saveAs(res.body, filename);
    }, error => {
      this.toastr.error(error.mess.description);
    });
  }

  getListCashHistory() {
    this._crmService.getListCashHistory(this.selectedContract.contractId).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.accountRecharge = res.data;
        this.totalRecord = res.data.length;
      }
    });
  }

  refreshETC() {
    this._vehiclesRFID.getBalance(this.selectedContract.custId, this.selectedContract.contractId).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.balance = res.data.balance;
      }
    });
  }
}
