import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { HTTP_CODE, STATUS_RFID_VEHICLE } from '@app/shared/constant/common.constant';
import { ActivatedRoute } from '@angular/router';
import { VehicleService, RESOURCE } from '@app/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../base-component/base-component.component';
import { AppStorage } from '@app/core/services/AppStorage';

@Component({
  selector: 'vehicle-info-shared',
  templateUrl: './vehicle-info.component.html',
  styleUrls: ['./vehicle-info.component.css'],
})
export class VehicleInfoComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() vehicleId: number;
  activeStatus = STATUS_RFID_VEHICLE;
  vehicleGroupOpt = [];
  vehicleTypeOpt = [];
  vehicleMarkOpt = [];
  vehicleColorOpt = [];
  vehicleBrandsOpt = [];
  vehiclePlateTypeOpt = [];
  constructor(
    protected _activatedRoute: ActivatedRoute,
    protected _vehicleService: VehicleService,
    protected _translateService: TranslateService
  ) {
    super(_activatedRoute, _vehicleService, RESOURCE.CUSTOMER, null, _translateService);
  }

  ngOnInit() {
    this.vehicleGroupOpt = AppStorage.get('vehicle-group');
    this.vehicleTypeOpt = AppStorage.get('vehicle-type');
    this.vehicleMarkOpt = AppStorage.get('vehicle-mark');
    this.vehicleBrandsOpt = AppStorage.get('vehicle-brands');
    this.vehicleColorOpt = AppStorage.get('vehicle-color');
    this.vehiclePlateTypeOpt = AppStorage.get('plate-types');
  }
  getDetail() {
    this._vehicleService.searchDetailsVehicle(this.searchModel, this.vehicleId).subscribe(rs => {
      if (rs.mess.code === HTTP_CODE.SUCCESS && rs.data) {
        this.dataModel = rs.data.listData[0];
        this.dataModel.nameType = this.vehicleTypeOpt.find(
          f => f.id === this.dataModel.vehicleTypeId
        )?.name;
        this.dataModel.nameGroup = this.vehicleGroupOpt.find(
          f => f.id === this.dataModel.vehicleGroupId
        )?.name;
        this.dataModel.mark = this.vehicleMarkOpt.find(
          f => f.id === this.dataModel.vehicleMarkId
        )?.val;
        this.dataModel.brand = this.vehicleBrandsOpt.find(
          f => f.id === this.dataModel.vehicleBrandId
        )?.val;
        this.dataModel.plateType = this.vehiclePlateTypeOpt.find(
          f => f.id === this.dataModel.plateType
        )?.val;
        this.dataModel.color = this.vehicleColorOpt.find(
          f => f.id === this.dataModel.vehicleColourId
        )?.val;
      }
    });
  }
  ngOnChanges() {
    if (this.vehicleId) {
      this.getDetail();
    } else {
      this.dataModel = {};
    }
  }
}
