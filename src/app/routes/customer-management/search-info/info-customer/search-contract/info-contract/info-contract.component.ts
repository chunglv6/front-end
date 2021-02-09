import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE, VehicleService } from '@app/core';
import { AppStorage } from '@app/core/services/AppStorage';
import { ContractService } from '@app/core/services/contract/contract.service';
import { CommonCRMService } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { HTTP_CODE, STATUS_CONTRACT } from '@app/shared/constant/common.constant';
import { MtxDialog, MtxGridColumn } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-info-contract',
  templateUrl: './info-contract.component.html',
  styleUrls: ['./info-contract.component.css'],
})
export class InfoContractComponent extends BaseComponent implements OnInit, OnChanges {
  columnsWithRFID: MtxGridColumn[] = [];
  listReason = [];
  displayedColumns = ['feeType', 'cost'];
  @Input() node: any;
  constructor(
    protected _contractService: ContractService,
    public actr: ActivatedRoute,
    public _translateService: TranslateService,
    public dialog?: MtxDialog,
    private _commonCRMService?: CommonCRMService,
    private _vehicleService?: VehicleService
  ) {
    super(actr, _contractService, RESOURCE.CONTRACT, null, _translateService);
  }

  ngOnInit() {

  }
  async bindData() {
    await this.getDetail();
    await this.getContractPayMent();
    await this.getBalance();
  }
  async getDetail() {
    const rs = await this._contractService
      .searchDetailsContract(this.searchModel, this.node.contractId)
      .toPromise();
    if (rs.mess.code === 1 && rs.data) {
      this.dataModel = rs.data.listData[0];
      switch (this.dataModel.status) {
        case STATUS_CONTRACT.CHUAHOATDONG:
          this.dataModel.statusName = this._translateService.instant('common.deadActive');
          break;
        case STATUS_CONTRACT.HOATDONG:
          this.dataModel.statusName = this._translateService.instant('common.active');
          break;
        case STATUS_CONTRACT.HUY:
          this.dataModel.statusName = this._translateService.instant('common.cancel');
          break;
        case STATUS_CONTRACT.CHAMDUT:
          this.dataModel.statusName = this._translateService.instant('common.deadActive')
          break;
        default:
          this.dataModel.statusName = ''
          break;
      }
      this.dataModel.emailNotification =
        this.dataModel.emailNotification == '0' || !this.dataModel.emailNotification
          ? false
          : true;
      this.dataModel.pushNotification =
        this.dataModel.pushNotification == '0' || !this.dataModel.pushNotification ? false : true;
      this.dataModel.smsNotification =
        this.dataModel.smsNotification == '0' || !this.dataModel.smsNotification ? false : true;
      this.dataModel.smsNew =
        this.dataModel.smsNew == '0' || !this.dataModel.smsNew ? false : true;
    }
  }
  async getContractPayMent() {
    this._commonCRMService.connectExistsViettelPay(this.node.contractId).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        const dataContractPayment = res.data;
        this.dataModel = Object.assign(this.dataModel, dataContractPayment);

        this.dataModel.methodRecharge = AppStorage.get('method-recharges').listData
          ? AppStorage.get('method-recharges').listData.find(
            x => x.id == this.dataModel.methodRechargeId
          )?.name
          : '';
        this.dataModel.accountBank = AppStorage.get('e-wallet').listData
          ? AppStorage.get('e-wallet').listData.find(x => x.id == this.dataModel.accountBankId)
            ?.name
          : '';
      }
    });
  }
  async getBalance() {
    const data = await this._vehicleService
      .getBalance(this.node.custId, this.node.contractId)
      .toPromise();
    if (data.mess.code === HTTP_CODE.SUCCESS) {
      this.dataModel.balance = data.data.balance;
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (!changes.node.currentValue.contractId) {
      this.dataModel = {};
    } else {
      this.bindData();
    }
  }
}
