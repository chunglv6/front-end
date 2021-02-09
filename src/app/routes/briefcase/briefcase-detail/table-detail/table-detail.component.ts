import { Component, OnInit, Input } from '@angular/core';
import { MtxDialog } from '@ng-matero/extensions';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { RESOURCE, VehicleService, ContractService } from '@app/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import {
  STATUS_VEHICLE_PROFILE,
  ACTION_TYPE,
  HTTP_CODE,
} from '@app/shared/constant/common.constant';

@Component({
  selector: 'table-detail-vehicle-tab',
  templateUrl: './table-detail.component.html',
  styleUrls: ['./table-detail.component.css'],
})
export class TableDetailComponent extends BaseComponent implements OnInit {
  titlePopup: string;
  statusVehicleProfile = STATUS_VEHICLE_PROFILE;
  @Input() vehicleId: number;
  constructor(
    public actr: ActivatedRoute,
    protected translateService: TranslateService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
    protected _vehicleService?: VehicleService,
    public _contractService?: ContractService
  ) {
    super(actr, _vehicleService, RESOURCE.CUSTOMER, toastr, translateService, dialog);
  }
  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'briefcase.type_paper', field: 'documentTypeName' },
      { i18n: 'briefcase.name_paper', field: 'fileName' },
      { i18n: 'briefcase.date_recie', field: 'createDate' },
      { i18n: 'briefcase.date_scan', field: 'scanDay' },
      { i18n: 'briefcase.status_gt', field: 'status' },
      { i18n: 'briefcase.download', field: 'download' },
    ];
    super.mapColumn();
    this.getData();
  }
  downLoadFile(item) {
    this._vehicleService.downloadProfileByVehicle(item.vehicleProfileId).subscribe(
      data => {
        saveAs(data, item.fileName);
      },
      () => {
        this.toastr.warning(this.translateService.instant('common.notify.fail'));
      }
    );
  }
  getData() {
    this.isLoading = true;
    this._vehicleService
      .searchVehicleProfiles({ actTypeId: ACTION_TYPE.DANG_KY_PT }, this.vehicleId)
      .subscribe(rs => {
        if (rs.mess.code === HTTP_CODE.SUCCESS) {
          this.dataModel.dataSource = rs.data.listData;
          this.totalRecord = rs.data.count;
          this.isLoading = false;
        }
      });
  }
}
