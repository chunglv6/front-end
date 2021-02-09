import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';
import { CustomerService } from '@app/core/services/customer/customer.service';
import { SharedDirectoryService } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { gender } from '@app/shared/constant/common.constant';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css'],
})
export class InfoComponent extends BaseComponent implements OnInit, OnChanges {
  attachList = [];
  @Input() id: number;
  place: any = {};
  placeRep: any;
  placeAuth: any;
  previous: any = {};
  constructor(
    public actr: ActivatedRoute,
    public dialog: MtxDialog,
    private _customerService: CustomerService,
    protected _toastr: ToastrService,
    protected _translateService: TranslateService,
    private _sharedDirectoryService: SharedDirectoryService
  ) {
    super(actr, _customerService, RESOURCE.CUSTOMER, _toastr, _translateService);
  }

  ngOnInit() {}
  async getDetail() {
    this.dataModel = (
      await this._customerService.findOne(this.id, '/customers').toPromise()
    ).data.listData[0];
    this.dataModel.gender = this.dataModel.gender
      ? gender.find(x => x.code === this.dataModel.gender)?.value
      : null;
  }
  async getDetailArea() {
    this.place = (
      await this._sharedDirectoryService.getAddressByCode(this.dataModel.areaCode).toPromise()
    ).data[0];
    this.dataModel.district = (
      await this._sharedDirectoryService.getAddressByCode(this.place.district).toPromise()
    ).data[0].name;
    this.dataModel.province = (
      await this._sharedDirectoryService.getAddressByCode(this.place.province).toPromise()
    ).data[0].name;
  }
  ngOnChanges(changes: SimpleChanges) {
    if (!changes.id.currentValue) {
      this.dataModel = {};
    } else {
      this.bindData();
    }
  }
  async bindData() {
    await this.getDetail();
    if (this.dataModel.type === 2) {
      await this.getDetailArea();
      await this.bindDetaiEnterprise();
    }
    this.previous = Object.assign(this.dataModel);
  }
  async bindDetaiEnterprise() {
    await this.getDetailAreaRep();
    await this.getDetailAreaAuth();
  }

  async getDetailAreaRep() {
    this.placeRep = (
      await this._sharedDirectoryService.getAddressByCode(this.dataModel.repAreaCode).toPromise()
    ).data[0];
    this.dataModel.repWard = this.placeRep?.name;
    this.dataModel.repDistrict = (
      await this._sharedDirectoryService.getAddressByCode(this.placeRep.district).toPromise()
    ).data[0]?.name;
    this.dataModel.repCity = (
      await this._sharedDirectoryService.getAddressByCode(this.placeRep.province).toPromise()
    ).data[0]?.name;
  }
  async getDetailAreaAuth() {
    this.placeAuth = (
      await this._sharedDirectoryService.getAddressByCode(this.dataModel.authAreaCode).toPromise()
    ).data[0];
    this.dataModel.authWard = this.placeAuth?.name;
    this.dataModel.authDistrict = (
      await this._sharedDirectoryService.getAddressByCode(this.placeRep.district).toPromise()
    ).data[0]?.name;
    this.dataModel.authCity = (
      await this._sharedDirectoryService.getAddressByCode(this.placeRep.province).toPromise()
    ).data[0]?.name;
  }
}
