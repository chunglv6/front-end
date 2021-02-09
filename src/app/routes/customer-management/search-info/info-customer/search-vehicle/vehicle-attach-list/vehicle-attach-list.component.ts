import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';
import { VehicleService } from '@app/core/services/vehicle/vehicle.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { saveAs } from 'file-saver';
import { ACTION_TYPE, HTTP_CODE } from '@app/shared/constant/common.constant';
@Component({
  selector: 'app-vehicle-attach-list',
  templateUrl: './vehicle-attach-list.component.html',
  styleUrls: ['./vehicle-attach-list.component.css'],
})
export class VehicleAttachListComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() vehicleId: number;
  constructor(
    protected _activatedRoute: ActivatedRoute,
    protected _translateService: TranslateService,
    protected _toastrService: ToastrService,
    protected _vehicleService: VehicleService
  ) {
    super(_activatedRoute, _vehicleService, RESOURCE.CONTRACT, _toastrService, _translateService);
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'customer-management.updateProfileTable.documentType', field: 'documentTypeName' },
      { i18n: 'customer-management.updateProfileTable.documentName', field: 'fileName' },
      { i18n: 'common.action', field: 'action', type: 'custom' },
    ];
  }
  getData() {
    this.isLoading = true;
    this.searchModel.actTypeId = ACTION_TYPE.DANG_KY_PT;
    this._vehicleService.searchVehicleProfiles(this.searchModel, this.vehicleId).subscribe(rs => {
      if (rs.mess.code === HTTP_CODE.SUCCESS) {
        this.dataModel.dataSource = rs.data.listData;
        this.totalRecord = rs.data.count;
        this.isLoading = false;
      }
    });
  }
  downLoadFile(item) {
    this._vehicleService.downloadProfileByVehicle(item.vehicleProfileId).subscribe(
      data => {
        saveAs(data, item.fileName);
      },
      () => {
        this._toastrService.warning(this._translateService.instant('common.notify.fail'));
      }
    );
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.vehicleId.currentValue) {
      this.getData();
    } else {
      this.totalRecord = 0;
      this.dataModel.dataSource = [];
    }
  }
}
