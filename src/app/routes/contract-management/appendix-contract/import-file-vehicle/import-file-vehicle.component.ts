import { Component, OnInit, Inject } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-import-file-vehicle',
  templateUrl: './import-file-vehicle.component.html',
  styleUrls: ['./import-file-vehicle.component.css']
})
export class ImportFileVehicleComponent extends BaseComponent implements OnInit {
  constructor(
    protected _translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public dataDialog: any
  ) {
    super();
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer-management.vehiclesNotRFIDTable.licensePlates', field: 'licensePlates' },
      { i18n: 'customer-management.vehiclesNotRFIDTable.vehiclesOwner', field: 'vehiclesOwner' },
      { i18n: 'customer-management.vehiclesNotRFIDTable.vehiclesType', field: 'vehiclesType' },
      { i18n: 'customer-management.newVehicleForm.vehicleWeight', field: 'vehicleWeight' },
      { i18n: 'customer-management.newVehicleForm.merchandiseWeight', field: 'merchandiseWeight' },
      { i18n: 'customer-management.newVehicleForm.allWeight', field: 'allWeight' },
      { i18n: 'customer-management.newVehicleForm.followWeight', field: 'followWeight' },
      { i18n: 'customer-management.newVehicleForm.seatsNumber', field: 'seatsNumber' },
      { i18n: 'customer-management.newVehicleForm.vehicleNumber', field: 'vehicleNumber' },
      { i18n: 'customer-management.newVehicleForm.framesNumber', field: 'framesNumber' },
      { i18n: 'customer-management.newVehicleForm.color', field: 'color' },
      { i18n: 'customer-management.newVehicleForm.label', field: 'label' },
      { i18n: 'customer-management.newVehicleForm.vehiclesSeri', field: 'vehiclesSeri' },
      { i18n: 'customer-management.newVehicleForm.licensePlateType', field: 'licensePlateType' },
      { i18n: 'customer-management.newVehicleForm.seriNumber', field: 'seriNumber' },

    ];
    super.mapColumn();
  }

}
