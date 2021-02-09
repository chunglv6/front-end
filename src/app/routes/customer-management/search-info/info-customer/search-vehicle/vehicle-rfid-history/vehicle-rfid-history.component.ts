import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE, VehicleService } from '@app/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-vehicle-rfid-history',
  templateUrl: './vehicle-rfid-history.component.html',
  styleUrls: ['./vehicle-rfid-history.component.css'],
})
export class VehicleRfidHistoryComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() vehicleId: number;
  constructor(
    protected _activatedRoute: ActivatedRoute,
    protected _translateService: TranslateService,
    protected _toastrService: ToastrService,
    protected _vehicleService: VehicleService
  ) {
    super(_activatedRoute, _vehicleService, RESOURCE.CUSTOMER, _toastrService, _translateService);
  }
  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'action_audit.actionType', field: 'act_Type' },
      {
        i18n: 'action_audit.createBy',
        field: 'action_User_Name',
      },
      { i18n: 'action_audit.create', field: 'create_Date' },
      { i18n: 'action_audit.requestBy', field: 'cREATE_USER' },
      { i18n: 'action_audit.reason', field: 'nAME' },
      { i18n: 'action_audit.prevContent', field: 'oLD_VALUE' },
      { i18n: 'action_audit.backContent', field: 'nEW_VALUE' },
    ];
    super.mapColumn();
  }
  getData() {
    this.isLoading = true;
    delete this.searchModel.pagesize;
  }
  ngOnChanges() {
    this.getData();
  }
}
