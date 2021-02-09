import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService, RESOURCE, VehicleService } from '@app/core';
import { InforRegisterVehicleModel } from '@app/core/models/customer-register.model';
import { AppStorage } from '@app/core/services/AppStorage';
import { RouteStore } from '@app/routes/routes.store';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { BuyTicketHistoryComponent } from '@app/shared/components/buy-ticket-history/buy-ticket-history.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogModel,
} from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import {
  ACTION_TYPE,
  HTTP_CODE,
  LIST_FUNC,
  STATUS_RFID_VEHICLE,
  STATUS_VEHICLE,
} from '@app/shared/constant/common.constant';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog, MtxGridColumn } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { ChangeStatusCardComponent } from './change-status-card/change-status-card.component';
import { RFIDTagComponent } from './rfid-tag/rfid-tag.component';

@Component({
  selector: 'app-vehicle-list-change-info',
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.css'],
})
export class VehicleListComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() node: any;
  columnsWithRFID: MtxGridColumn[] = [];
  selection = new SelectionModel<any>(true, []);
  selectionNoRfid = new SelectionModel<any>(true, []);
  displayedColumns = [];
  displayedColumnsWithRFID = [];
  isLoadingRFID = true;
  searchModelRFID: any = {};
  custId: number;
  activeStatus = STATUS_RFID_VEHICLE;
  statusVehicle = STATUS_VEHICLE;
  listFunc = LIST_FUNC;
  formatDate = COMMOM_CONFIG.DATE_FORMAT;
  pageIndexRfid = 0;
  startFrom = new FormControl();
  endFrom = new FormControl();
  startRFIDFrom = new FormControl();
  endRFIDFrom = new FormControl();
  constructor(
    protected _vehicleService: VehicleService,
    public actr: ActivatedRoute,
    public _translateService: TranslateService,
    public dialog: MtxDialog,
    public _toastrService: ToastrService,
    private _routeStore: RouteStore,
    private _router: Router,
    private _contractService: ContractService
  ) {
    super(actr, _vehicleService, RESOURCE.CONTRACT, null, _translateService);
    this.searchModelRFID.startrecord = 0;
    this.searchModelRFID.pagesize = this.pageSizeList[0];
  }
  ngOnInit() {
    this.dataModel.vehicleGroupOpt = AppStorage.get('vehicle-group');
    this.dataModel.vehicleTypeOpt = AppStorage.get('vehicle-type');
    this.columns = [
      { i18n: 'common.select', field: 'select' },
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer-management.vehiclesNotRFIDTable.licensePlates', field: 'plateNumber' },
      {
        i18n: 'customer-management.vehiclesNotRFIDTable.vehiclesOwner',
        field: 'owner',
      },
      {
        i18n: 'customer-management.vehiclesNotRFIDTable.vehiclesTypeFee',
        field: 'nameType',
      },
      { i18n: 'vehicle.cargoVolume', field: 'cargoWeight' },
      { i18n: 'vehicle.seatAmount', field: 'seatNumber' },
      {
        i18n: 'customer-management.vehiclesNotRFIDTable.resultCheck',
        field: 'status',
      },
    ];
    super.mapColumn();
    this.columnsWithRFID = [
      { i18n: '', field: 'select' },
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      {
        i18n: 'customer-management.vehiclesHaveRFIDTable.licensePlates',
        field: 'plateNumber',
      },
      {
        i18n: 'customer-management.vehiclesHaveRFIDTable.serialNumber',
        field: 'rfidSerial',
      },
      { i18n: 'vehicle.groupTypeVehicleFee', field: 'nameGroup' },
      {
        i18n: 'customer-management.vehiclesHaveRFIDTable.feeCollection',
        field: 'salesType',
      },
      {
        i18n: 'customer-management.vehiclesHaveRFIDTable.cardStatus',
        field: 'activeStatus',
      },
      { i18n: 'common.action', field: 'action' },
    ];
    this.displayedColumnsWithRFID = this.columnsWithRFID.map(x => x.field);
    this.custId = this.node.custId;
  }

  //#region event checkbox
  isAllSelected() {
    const numSelected = this.selection.selected?.length;
    const numRows = this.dataModel.dataSourceWithRFID
      ? this.dataModel.dataSourceWithRFID.filter(
        x => x.activeStatus === this.activeStatus.CHUAKICHHOAT
      )?.length
      : 0;
    return numSelected === numRows;
  }
  isAllSelectedNoRfid() {
    const numSelected = this.selectionNoRfid.selected?.length;
    const numRows = this.dataModel.dataSourceNotRFID
      ? this.dataModel.dataSourceNotRFID.filter(x => x.status === STATUS_VEHICLE.KHOP)?.length
      : 0;
    return numSelected === numRows;
  }
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.dataModel.dataSourceWithRFID.forEach(row => {
        row.selected = false;
      });
    } else {
      this.dataModel.dataSourceWithRFID.forEach(row => {
        if (row.activeStatus === this.activeStatus.CHUAKICHHOAT) {
          this.selection.select(row);
          row.selected = true;
        }
      });
    }
  }
  masterNoRfidToggle() {
    if (this.isAllSelectedNoRfid()) {
      this.selectionNoRfid.clear();
      this.dataModel.dataSourceNotRFID.forEach(row => {
        row.selected = false;
      });
    } else {
      this.dataModel.dataSourceNotRFID.forEach(row => {
        if (row.status === STATUS_VEHICLE.KHOP) {
          this.selectionNoRfid.select(row);
          row.selected = true;
        }
      });
    }
  }
  checkChangeNoRfid(row) {
    this.selectionNoRfid.toggle(row);
    row.selected = !this.selectionNoRfid.isSelected(row) ? false : true;
  }
  checkChange(row) {
    this.selection.toggle(row);
    row.selected = !this.selection.isSelected(row) ? false : true;
  }
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
  checkboxLabelNoRfid(row?: any): string {
    if (!row) {
      return `${this.isAllSelectedNoRfid() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionNoRfid.isSelected(row) ? 'deselect' : 'select'} row ${row.position +
      1}`;
  }
  //#endregion
  //#region load data lên bảng
  getData() {
    if (!this.startFrom.hasError('matDatepickerMax')) {
      this.isLoading = true;
      this.searchModel.startDate = this.startFrom.value
        ? moment(this.startFrom.value)
          .format(COMMOM_CONFIG.DATE_FORMAT)
          .toString()
        : null;
      this.searchModel.endDate = this.endFrom.value
        ? moment(this.endFrom.value)
          .format(COMMOM_CONFIG.DATE_FORMAT)
          .toString()
        : null;
      if (!this.searchModel.startDate) {
        delete this.searchModel.startDate;
      }
      if (!this.searchModel.endDate) {
        delete this.searchModel.endDate;
      }
      this._vehicleService
        .searchVehiclesNotAssignRFID(this.searchModel, this.node.contractId)
        .subscribe(rs => {
          if (rs.mess.code === HTTP_CODE.SUCCESS) {
            this.dataModel.dataSourceNotRFID = rs.data.listData;
            this.selectionNoRfid.clear();
            this.dataModel.dataSourceNotRFID.map(x => {
              x.nameType = this.dataModel.vehicleTypeOpt.find(f => f.id === x.vehicleTypeId)?.name;
              return x;
            });
            this.dataModel.totalRecord = rs.data.count;
            this.isLoading = false;
          }
        });
    }
  }
  getDataVehicleWithRFID() {
    if (!this.startRFIDFrom.hasError('matDatepickerMax')) {
      this.isLoadingRFID = true;
      this.searchModelRFID.startDate = this.startRFIDFrom.value
        ? moment(this.startRFIDFrom.value)
          .format(COMMOM_CONFIG.DATE_FORMAT)
          .toString()
        : null;
      this.searchModelRFID.endDate = this.endRFIDFrom.value
        ? moment(this.endRFIDFrom.value)
          .format(COMMOM_CONFIG.DATE_FORMAT)
          .toString()
        : null;
      this._vehicleService
        .searchVehiclesAssignRFID(this.searchModelRFID, this.node.contractId)
        .subscribe(rs => {
          if (rs.mess.code === HTTP_CODE.SUCCESS) {
            this.selection.clear();
            this.dataModel.dataSourceWithRFID = rs.data.listData;
            this.dataModel.dataSourceWithRFID.map(x => {
              x.nameGroup = this.dataModel.vehicleGroupOpt.find(
                f => f.id === x.vehicleGroupId
              )?.name;
              return x;
            });
            this.dataModel.totalRecordRFID = rs.data.count;
            this.isLoadingRFID = false;
          }
        });
    }
  }
  ngOnChanges() {
    this.getData();
    this.getDataVehicleWithRFID();
  }
  //#endregion
  //#region gán thẻ
  rfidTag() {
    this.rfidTagModal(this.selectionNoRfid.selected, RFIDTagComponent);
  }

  rfidTagModal(record?, componentTemplate?) {
    const dialogRef = this.dialog.open(
      {
        data: record,
        width: '40%',
        panelClass: 'my-dialog',
      },
      componentTemplate
    );
    dialogRef.afterClosed().subscribe(rs => {
      if (rs) {
        const data = record.map(x => x.vehicleId);
        const body = {
          startRfidSerial: rs,
          actTypeId: ACTION_TYPE.GAN_THE,
          addVehicleRequestDTOS: data.map(x => {
            return {
              vehicleId: x,
            };
          }),
        };
        this._vehicleService.assignRfid(this.node.custId, this.node.contractId, body).subscribe(
          res => {
            if (res.list.length > 0) {
              let arrRfidSuccess = [];
              let arrRfidFail = [];
              arrRfidSuccess = res.list
                .filter(x => x.descriptions === 'SUCCESS')
                .map(r => r.rfidSerial);
              arrRfidFail = res.list
                .filter(x => x.descriptions !== 'SUCCESS')
                .map(r => r.rfidSerial);
              if (arrRfidSuccess.length > 0) {
                this._toastrService.success(
                  this.translateService.instant('common.assign-rfid-success') +
                  arrRfidSuccess.join(','),
                  this._translateService.instant('search-information.success')
                );
                this.getData();
                this.getDataVehicleWithRFID();
                this.selectionNoRfid.clear();
              }
              if (arrRfidFail.length > 0) {
                this.getData();
                this.getDataVehicleWithRFID();
                this._toastrService.error(
                  this.translateService.instant('common.assign-rfid-fail') + arrRfidFail.join(','),
                  this._translateService.instant('search-information.error')
                );
              }
            } else {
              this._toastrService.success(this._translateService.instant('common.notify.fail'));
            }
          },
          err => {
            this._toastrService.error(err.mess.description);
            this.selectionNoRfid.clear();
          }
        );
      }
    });
  }
  //#endregion
  //#region đôi trạng thái thẻ
  changeStatusCard(item, status) {
    const dialogRef = this.dialog.open(
      {
        width: '80%',
        panelClass: 'my-dialog',
        data: {
          status,
          custId: this.node.custId,
          item,
        },
      },
      ChangeStatusCardComponent
    );
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe(rs => {
      if (rs) {
        const body = {
          actTypeId: null,
          custId: this.node.custId,
          serialRFID: item.rfidSerial,
          amount: rs.fee,
          reasonId: rs.reason,
          userLogin: AppStorage.getUserLogin(),
        };

        if (status === LIST_FUNC.KHOATHE) {
          body.actTypeId = ACTION_TYPE.KHOATHE;
          this.lock(body, item.vehicleId);
        }

        if (status === LIST_FUNC.MOTHE) {
          body.actTypeId = ACTION_TYPE.MOTHE;
          this.unlock(body, item.vehicleId);
        }
        if (status === LIST_FUNC.HUYTHE) {
          body.actTypeId = ACTION_TYPE.HUYTHE;
          this.destroy(item.vehicleId, body);
        }
      }
    });
  }

  lock(body, vehicleId) {
    this._vehicleService.lockRFID(body, vehicleId).subscribe(
      rs => {
        if (rs.mess.code === HTTP_CODE.SUCCESS) {
          this._toastrService.success(this._translateService.instant('common.notify.save.success'));
          this.getDataVehicleWithRFID();
        } else {
          this._toastrService.warning(this._translateService.instant(rs.mess.description));
        }
      },
      () => {
        this._toastrService.error(this._translateService.instant('common.notify.fail'));
      }
    );
  }
  unlock(body, vehicleId) {
    this._vehicleService.unLockRFID(body, vehicleId).subscribe(
      rs => {
        if (rs.mess.code === HTTP_CODE.SUCCESS) {
          this._toastrService.success(this._translateService.instant('common.notify.save.success'));
          this.getDataVehicleWithRFID();
        } else {
          this._toastrService.warning(this._translateService.instant(rs.mess.description));
        }
      },
      () => {
        this._toastrService.error(this._translateService.instant('common.notify.fail'));
      }
    );
  }
  destroy(vehicleId, rfidDTO) {
    this._vehicleService.destroyRFID(vehicleId, rfidDTO).subscribe(
      rs => {
        if (rs.mess.code === HTTP_CODE.SUCCESS) {
          this._toastrService.success(this._translateService.instant('common.notify.save.success'));
          this.getDataVehicleWithRFID();
        } else {
          this._toastrService.warning(this._translateService.instant(rs.mess.description));
        }
      },
      () => {
        this._toastrService.error(this._translateService.instant('common.notify.fail'));
      }
    );
  }
  //#endregion
  // kiểm tra đăng kiểm
  check() {
    const data = this.dataModel.dataSourceNotRFID.filter(x => x.status !== STATUS_VEHICLE.KHOP);
    if (data.length > 0) {
      const body = {
        data
      };
      this._vehicleService.vehicleRegisterInfor(body).subscribe(rs => {
        if (rs.mess.code === HTTP_CODE.SUCCESS) {
          this.getData();
        } else {
          this._toastrService.warning(this._translateService.instant(rs.mess.description));
        }
      }, (err) => {
        this._toastrService.warning(this._translateService.instant('common.500Error'));
      });
    }
  }
  // danh sách vé tháng/quý đã mua(để giai đoạn 2)
  showListTicket(item) {
    this._contractService.searchDetailsContract(null, this.node.contractId).subscribe(rs => {
      if (rs.mess.code === HTTP_CODE.SUCCESS) {
        this.dialog.originalOpen(BuyTicketHistoryComponent, {
          width: '80%',
          data: { data: { item, dataContract: rs.data.listData[0] }, isView: false },
        });
      } else {
        this._toastrService.warning(this._translateService.instant(rs.mess.description));
      }
    });
  }
  // kích hoạt nhiều thẻ
  onMutilActive(data) {
    let ids = [];
    if (data) {
      ids.push(data.vehicleId);
    } else {
      ids = this.selection.selected.map(x => x.vehicleId);
    }
    const dialogData = new ConfirmDialogModel(
      this.translateService.instant('common.button.confirm'),
      this.translateService.instant('policy.question-accept')
    );
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData,
    });
    dialogRef.disableClose = true;
    const body = {
      custId: this.node.custId,
      actTypeId: ACTION_TYPE.KICHHOATTHE,
    };
    dialogRef.afterClosed().subscribe(
      dialogResult => {
        if (dialogResult) {
          this._vehicleService.activeMutilRFID(body, ids).subscribe(rs => {
            if (rs.mess.code === HTTP_CODE.SUCCESS) {
              const listVehicleActiveSuccess = [];
              const listVehicleActiveFail = [];
              rs.data.activeResponses.forEach(element => {
                if (element.result === 'SUCCESS') {
                  listVehicleActiveSuccess.push(element.rfidSerial);
                }
                if (element.result === 'FAIL') {
                  listVehicleActiveFail.push(element.rfidSerial);
                }
              });
              if (listVehicleActiveSuccess.length > 0) {
                if (data) {
                  this._toastrService.success(this.translateService.instant('vehicle.active_rfid_success'));
                } else {
                  this._toastrService.success(
                    this.translateService.instant('common.active-rfid-success') +
                    listVehicleActiveSuccess.join(','),
                    null,
                    {
                      disableTimeOut: true,
                      closeButton: true,
                    }
                  );
                }
              }
              if (listVehicleActiveFail.length > 0) {
                if (data) {
                  this._toastrService.warning(this.translateService.instant('vehicle.active_rfid_fail'));
                } else {
                  this._toastrService.warning(
                    this.translateService.instant('common.active-rfid-fail') +
                    listVehicleActiveFail.join(','),
                    null,
                    {
                      disableTimeOut: true,
                      closeButton: true,
                    }
                  );
                }

              }
              this.getDataVehicleWithRFID();
            } else {
              this._toastrService.warning(this._translateService.instant(rs.mess.description));
            }
          });
        }
      },
      error => {
        this._toastrService.error(this._translateService.instant('vehicle.update_ocs_false'));
      }
    );
  }
  // thêm phương tiện
  addVehicle() {
    const objSendRegisterVehicle: InforRegisterVehicleModel = {
      customerId: this.node.custId,
      contractId: this.node.contractId,
    };
    this._routeStore.sendInforRegisterVehicle(objSendRegisterVehicle);
    this._routeStore.changeBackToRegisterVehicle(true);
    this._router.navigate(['register-services']);
  }
  //#region  common
  onSeachRFID() {
    this.pageIndexRfid = 0;
    this.searchModelRFID.startrecord = 0;
    this.getDataVehicleWithRFID();
  }
  changePageRFID(event) {
    this.pageIndexRfid = event.pageIndex;
    this.searchModelRFID.startrecord =
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize;
    this.searchModelRFID.pagesize = event.pageSize;
    this.getDataVehicleWithRFID();
  }
  getWidth() {
    return window.innerWidth - 500 + 'px';
  }
  selectRfidVehicle(row) {
    if (row.activeStatus !== this.activeStatus.CHUAKICHHOAT) {
      row.selected = false;
    } else {
      this.selection.toggle(row);
    }
  }
  selectRowVehicle(row) {
    if (row.status !== this.statusVehicle.KHOP) {
      row.selected = false;
    } else {
      this.selectionNoRfid.toggle(row);
    }
  }
  //#endregion
}
