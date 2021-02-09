import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE, VehicleService } from '@app/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { FormControl, Validators } from '@angular/forms';
import { HTTP_CODE } from '@app/shared';

@Component({
  selector: 'app-vehicle-action-audit',
  templateUrl: './vehicle-action-audit.component.html',
  styleUrls: ['./vehicle-action-audit.component.css'],
})
export class VehicleActionAuditComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() dataSelect: any;
  startDateForm = new FormControl(null, Validators.required);
  endDateForm = new FormControl(null, Validators.required);
  constructor(
    protected _activatedRoute: ActivatedRoute,
    protected _translateService: TranslateService,
    protected _toastrService: ToastrService,
    protected _vehicleService: VehicleService
  ) {
    super(_activatedRoute, null, RESOURCE.CUSTOMER, _toastrService, _translateService);
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'action_audit.actionType', field: 'actionType' },
      { i18n: 'action_audit.createBy', field: 'actionUserName' },
      { i18n: 'action_audit.create', field: 'actionDate', type: 'datetime' },
      { i18n: 'action_audit.requestBy', field: 'userName' },
      { i18n: 'action_audit.reason', field: 'reason' },
    ];
  }
  getData() {
    if (this.startDateForm.valid && this.endDateForm.valid) {
      this.isLoading = true;
      this.searchModel.startDate = this.startDateForm.value
        ? moment(this.startDateForm.value)
            .format(COMMOM_CONFIG.DATE_FORMAT)
            .toString()
        : null;
      this.searchModel.endDate = this.endDateForm.value
        ? moment(this.endDateForm.value)
            .format(COMMOM_CONFIG.DATE_FORMAT)
            .toString()
        : null;
      this._vehicleService
        .searchActionVehicleHistories(
          this.searchModel,
          this.dataSelect.custId,
          this.dataSelect.contractId,
          this.dataSelect.vehicleId
        )
        .subscribe(rs => {
          if (rs.mess.code === HTTP_CODE.SUCCESS) {
            this.dataModel.dataSource = rs.data.listData;
            this.totalRecord = rs.data.count;
            this.isLoading = false;
          }
        });
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (!changes.dataSelect.currentValue.custId) {
      this.dataModel.dataSource = [];
      this.totalRecord = 0;
    }
  }
}
