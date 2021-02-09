import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';
import { VehicleService } from '@app/core/services/vehicle/vehicle.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { STATUS_RFID_VEHICLE } from '@app/shared/constant/common.constant';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-info-vehicle',
  templateUrl: './info-vehicle.component.html',
  styleUrls: ['./info-vehicle.component.css'],
})
export class InfoVehicleComponent extends BaseComponent implements OnInit {
  @Input() vehicleId: number;
  activeStatus = STATUS_RFID_VEHICLE;
  constructor(
    protected _activatedRoute: ActivatedRoute,
    protected _vehicleService: VehicleService,
    protected _translateService: TranslateService
  ) {
    super(_activatedRoute, _vehicleService, RESOURCE.CUSTOMER, null, _translateService);
  }

  ngOnInit() {}
}
