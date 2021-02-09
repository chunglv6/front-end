// author hieulx

import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core/app-config';
import { ContractService } from '@app/core/services/contract/contract.service';
import { VehicleService } from '@app/core/services/vehicle/vehicle.service';
import { PeriodicElement } from '@app/routes/customer-management/buy-ticket/buy-ticket.component';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions/dialog';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ContractManagementStore } from '../../contract-management.store';
import { STATUS_RFID_VEHICLE, HTTP_CODE } from '@app/shared/constant/common.constant';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppStorage } from '@app/core/services/AppStorage';
import { debounceTime, tap } from 'rxjs/operators';


@Component({
  selector: 'detach-contract-detach',
  templateUrl: './detach-contract-detach.component.html',
})

export class DetachContractDetachComponent extends BaseComponent implements OnInit {
  selection = new SelectionModel<any>(true, []);
  public show = false;
  public buttonName: any = 'Show';
  @ViewChild('tableFile') tableFile: MatTable<any>;
  selectContract: any = {};
  states = [];
  value: string;
  filteredStates = this.states;
  listVehicleSplit: any[] = [];
  activeDate;
  endActiveDate;
  activeStatusVehicle = STATUS_RFID_VEHICLE;

  signDate: string;
  effDate: string;
  expDate: string;
  formInformation: FormGroup;
  isLoadingAuto: boolean;

  formatDate = COMMOM_CONFIG.DATE_FORMAT;
  constructor(
    protected _translate: TranslateService,
    private _toastrService: ToastrService,
    private _vehicleService: VehicleService,
    private _contractManagementStore: ContractManagementStore,
    protected translateService: TranslateService,
    public actr: ActivatedRoute,
    private fb: FormBuilder,
    public dialog: MtxDialog,

    private _contractsInfoService: ContractService,
  ) {
    super(actr, RESOURCE.CONTRACT);

  }

  toggle() {
    this.show = !this.show;

    if (this.show) this.buttonName = 'Hide';
    else this.buttonName = 'Show';
  }

  ngOnInit() {
    this.isLoading = false;

    this.formInformation = this.fb.group({
      searchContract: ['', Validators.required],
    });
    this.dataModel.vehicleGroupOpt = AppStorage.get('vehicle-group');
    this.dataModel.vehicleTypeOpt = AppStorage.get('vehicle-type');

    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'briefcase.license_plates', field: 'plateNumber' },
      { i18n: 'policy.vehiclesTypeFee', field: 'nameGroup' },
      { i18n: 'contractAppendix.boss-vehicle', field: 'owner' },
      { i18n: 'contractAppendix.type-vehicle', field: 'nameType' },
      { i18n: 'change_card.serial_number', field: 'rfidSerial' },
      { i18n: 'change_card.card_status', field: 'activeStatus' },
      { i18n: 'change_card.card_status', field: 'select' }
    ];
    super.mapColumn();
    this.selection.changed.asObservable().subscribe(select => {
      if (select.added.length > 0) {
        this.listVehicleSplit.push(select.added[0]);
      } else {
        select.removed.forEach(element => {
          const findIndex = this.listVehicleSplit.findIndex(vehicle => vehicle.plateNumber == element.plateNumber);
          this.listVehicleSplit.splice(findIndex, 1);
        });
      }
    });

    this.formInformation.get('searchContract').valueChanges.pipe(debounceTime(1000), tap(() => this.isLoadingAuto = true)).subscribe(value => {
      if (typeof value !== 'object') {
        this._contractsInfoService.searchContractInfo(value.trim()).subscribe(rs => {
          this.isLoadingAuto = false;
          this.filteredStates = rs.data.listData;
        });
      }
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataModel.dataSource ? this.dataModel.dataSource.length : 0;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataModel.dataSource.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  confirmDialog(value: any): void {
    const dialogData = new ConfirmDialogModel(this.translateService.instant('customer.notification'), this.translateService.instant('customer.action'));

    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {

      }
    });
  }

  filter() {
    if (this.formInformation.controls.searchContract.value?.trim()) {
      this._contractsInfoService.searchContractInfo(this.formInformation.controls.searchContract.value?.trim()).subscribe(rs => {
        if (rs.mess.code == HTTP_CODE.SUCCESS && rs.data.listData.length > 0) {
          this.selectContract = rs.data.listData[0];
          this.getData();
          this.signDate = this.selectContract.signDate ? this.selectContract.signDate.split(' ')[0] : null;
          this.effDate = this.selectContract.effDate ? this.selectContract.effDate.split(' ')[0] : null;
          this.expDate = this.selectContract.expDate ? this.selectContract.expDate.split(' ')[0] : null;
        }
      }, (err) => {
        this._toastrService.warning(this._translate.instant(err.mess.description));
      });
    }
  }
  getOptionText(option) {
    if (option) {
      return option.contractNo;
    }
  }

  getData() {
    this.isLoading = true;
    this.searchModel.startDate = this.activeDate ? moment(this.activeDate).format(COMMOM_CONFIG.DATE_FORMAT).toString() : null;
    this.searchModel.endDate = this.endActiveDate ? moment(this.endActiveDate).format(COMMOM_CONFIG.DATE_FORMAT).toString() : null;
    this._vehicleService.searchVehiclesAssignRFID(this.searchModel, this.selectContract.contractId).subscribe(rs => {
      if (rs.mess.code === HTTP_CODE.SUCCESS) {
        this.isLoading = false;
        this.dataModel.dataSource = rs.data.listData.filter(data => (data.activeStatus == STATUS_RFID_VEHICLE.HOATDONG || data.activeStatus == STATUS_RFID_VEHICLE.HUY || data.activeStatus == STATUS_RFID_VEHICLE.DONG || data.activeStatus == STATUS_RFID_VEHICLE.MO));
        this.dataModel.dataSource.map(x => {
          x.nameGroup = this.dataModel.vehicleGroupOpt.find(f => f.id == x.vehicleGroupId)?.name;
          return x;
        });
        this.dataModel.dataSource.map(x => {
          x.nameType = this.dataModel.vehicleTypeOpt.find(f => f.id == x.vehicleTypeId)?.name;
          return x;
        });
        this.totalRecord = this.dataModel.dataSource ? this.dataModel.dataSource.length : 0;
        this.isLoading = false;
      } else if (rs.mess.code == HTTP_CODE.UNDEFINED) {
        this._toastrService.warning(this._translate.instant('common.500Error'));
      } else {
        this._toastrService.warning(rs.mess.description);
      }
    });
  }

  onSelectedContract(event) {
    this.selectContract = event.option.value;
    this.getData();
    this.signDate = this.selectContract.signDate ? this.selectContract.signDate.split(' ')[0] : null;
    this.effDate = this.selectContract.effDate ? this.selectContract.effDate.split(' ')[0] : null;
    this.expDate = this.selectContract.expDate ? this.selectContract.expDate.split(' ')[0] : null;
  }

  detachVehicle() {
    const listInfo = {
      listVehicleSplit: this.listVehicleSplit,
      infoContract: this.selectContract
    };
    this._contractManagementStore.changeListContractDetach(listInfo);
  }
}
