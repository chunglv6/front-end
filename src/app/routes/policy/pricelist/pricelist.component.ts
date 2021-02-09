import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { MtxDialog } from '@ng-matero/extensions';
import { RESOURCE } from '@app/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ConfirmDialogModel, ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { BriefcaseDenialComponent } from '@app/routes/briefcase/briefcase-approve/briefcase-denial/briefcase-denial.component';
import { CommonCRMService, SharedDirectoryService } from '@app/shared';
import { SCOPE, STATUS_HANDLE } from '@app/shared/constant/common.constant';
import moment from 'moment';
import { COMMOM_CONFIG } from '@env/environment';
import { SelectionModel } from '@angular/cdk/collections';
import { saveAs } from 'file-saver';
import { TicketPricesService } from '@app/core/services/policy/ticket-prices.service';
import { ConfirmBoldFormDialogModel, ConfirmDialogBoldFormComponent } from '@app/shared/components/confirm-dialog-bold-form/confirm-dialog-bold-form.component';

@Component({
  selector: 'app-pricelist',
  templateUrl: './pricelist.component.html',
  styleUrls: ['./pricelist.component.css']
})
export class PricelistComponent extends BaseComponent implements OnInit {
  listTicketPriceTypes = [];
  minEffectiveDate = new Date(Date.now());
  createDateFrom = null;
  createDateTo = null;
  approveDateFrom = null;
  approveDateTo = null;
  startDateFrom = null;
  endDateTo = null;
  listVehicleType = [];
  listRoutes = [];
  listStages = [];
  listStationOpen = [];
  selectedTicket: string;
  typeRegister: string;
  vehiclesTypeFee: string;
  route: string;
  distanceType: string;
  station: string;
  statusHand: string;
  effect = null;
  expire = null;
  lstScope = SCOPE;
  lstStatus = STATUS_HANDLE;
  listLaneOpen = [];
  stationId: number;
  selection = new SelectionModel<any>(true, []);
  listDataPrice = [];
  body = {};
  servicePlanListId = [];
  servicePlanId: number;
  searchModelExcel: any = {};
  startCreateDateForm = new FormControl();
  startApproveDateForm = new FormControl();
  startEffectDateForm = new FormControl();
  statusApproved = STATUS_HANDLE;


  // phạm vi áp dụng
  listScope = [
    { value: SCOPE.TRAM, label: this.translateService.instant('contract.billing.station') },
    { value: SCOPE.DOAN, label: this.translateService.instant('buyTicket.distance_type') },
    // { value: SCOPE.TOANQUOC, label: this.translateService.instant('pricelist.nationwide') }
  ];
  // Status
  listStatusHandle = [
    { value: STATUS_HANDLE.CHODUYET, label: this.translateService.instant('pricelist.wait') },
    { value: STATUS_HANDLE.DADUYET, label: this.translateService.instant('pricelist.approve') },
    { value: STATUS_HANDLE.TUCHODUYET, label: this.translateService.instant('pricelist.refuse_approve') },
    { value: STATUS_HANDLE.DAHUYHIEULUC, label: this.translateService.instant('pricelist.invalidate') },
  ];

  constructor(
    public actr: ActivatedRoute,
    protected toastr: ToastrService,
    protected _translateService: TranslateService,
    public dialog?: MtxDialog,
    public _router?: Router,
    public _commonCRMService?: CommonCRMService,
    public _sharedDirectoryService?: SharedDirectoryService,
    public _ticketPricesService?: TicketPricesService


  ) {
    super(actr, _commonCRMService, RESOURCE.POLICY, toastr, _translateService, dialog);
  }
  public show = false;
  public buttonName: any = 'Show';
  toggle() {
    this.show = !this.show;

    if (this.show) this.buttonName = 'Hide';
    else this.buttonName = 'Show';
  }

  ngOnInit() {
    this.isLoading = false;
    this.columns = [
      { i18n: 'policy.checkbox', field: 'checkbox' },
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'buyTicket.ticket', field: 'servicePlanTypeIdName' },
      { i18n: 'pricelist.scope', field: 'scope' },
      { i18n: 'policy.stationPhase', field: 'stationStagesId' },
      { i18n: 'policy.input-lane', field: 'laneIn' },
      { i18n: 'policy.output-lane', field: 'laneOut' },
      { i18n: 'policy.vehiclesTypeFee', field: 'vehicleGroupId' },
      { i18n: 'policy.fare', field: 'fee' },
      { i18n: 'policy.ocsCode', field: 'ocsCode' },
      { i18n: 'policy.effectiveDate', field: 'effDate' },
      { i18n: 'policy.date_created', field: 'createDate' },
      { i18n: 'policy.personCreated', field: 'createUser' },
      { i18n: 'common.status', field: 'statusName' },
      { i18n: 'common.action', field: 'action' },
    ];
    super.mapColumn();
    this.getData();
  }

  async getData() {
    await this.getListTicketPriceTypes();
    await this.getListVehicleTypes();
    await this.getListRoutes();
    await this.getStages();
    await this.getStationsOpens();
    await this.searchPriceList();
  }

  async searchPriceList(isViewPage?: boolean) {
    this.dataModel.isAllSelected = false;
    if (!isViewPage) {
      this.searchModel.startrecord = 0;
      this.pageIndex = 0;
    }
    this.isLoading = true;
    this.handleSearchModelTrim();
    await this.getLanesIn();
    await this._ticketPricesService.searchTicketPrices(this.searchModel).toPromise().then(res => {
      if (res.mess.code == 1) {
        this.dataModel.dataSource = res.data.listData.map(val => {
          let stationStagesName = '';
          if (val.scope == SCOPE.TRAM) {
            const findStation = this.listStationOpen.find(s => s.code == val.stationId);
            stationStagesName = findStation ? findStation.value : '';
          } else if (val.scope == SCOPE.DOAN) {
            const findStages = this.listStages.find(s => s.id == val.stageId);
            stationStagesName = findStages ? findStages.name : '';
          }
          const findScope = this.listScope.find(s => s.value == val.scope);
          const scopeName = findScope ? findScope.label : '';
          const findStatus = this.listStatusHandle.find(status => status.value == val.status);
          const statusName = findStatus ? findStatus.label : '';
          const findvehicleGroupId = this.listVehicleType.find(item => item.code == val.vehicleGroupId);
          const vehicleTypeFeeName = findvehicleGroupId ? findvehicleGroupId.value : '';
          const findLanneIn = this.listLaneOpen.find(item => item.code == val.laneIn)
          const laneNaneIn = findLanneIn ? findLanneIn.value : '';
          const findLanneOut = this.listLaneOpen.find(item => item.code == val.laneOut)
          const laneNaneOut = findLanneOut ? findLanneOut.value : '';
          return {
            servicePlanTypeIdName: this.listTicketPriceTypes.filter(item => item.code === val.servicePlanTypeId)[0].value,
            servicePlanTypeId: val.servicePlanTypeId,
            scope: scopeName,
            stationStagesId: stationStagesName,
            laneIn: laneNaneIn,
            laneOut: laneNaneOut,
            vehicleGroupId: vehicleTypeFeeName,
            fee: val.fee,
            ocsCode: val.ocsCode,
            effDate: val.effDate,
            createDate: val.createDate,
            createUser: val.createUser,
            statusName: statusName,
            status: val.status,
            servicePlanId: val.servicePlanId,
          };
        });
        this.totalRecord = res.data.count;
        this.isLoading = false;
        this.listDataPrice = this.dataModel.dataSource;
      }
    });
  }

  createNewPrice() {
    this._router.navigate(['policy', 'pricelist_add']);
  }
  processImportFile() { }

  editRecord(item) {
    this._router.navigate(['policy', 'pricelist_edit', item.servicePlanId]);
  }

  onPageChangePricelist(event) {
    this.selection.clear();
    this.pageIndex = event.pageIndex;
    this.searchModel.startrecord = event.pageIndex == 0 ? event.pageIndex : ((event.pageIndex * event.pageSize));
    this.searchModel.pagesize = event.pageSize;
    this.searchPriceList(true);
  }

  // loai ve
  async getListTicketPriceTypes() {
    await this._commonCRMService.getTicketPriceTypes().toPromise().then(res => {
      if (res.mess.code == 1) {
        this.listTicketPriceTypes = res.data.listData.map(val => {
          return {
            code: val.servicePlanTypeId,
            value: val.name
          };
        });
      }
    });
  }

  // Loại phương tiện thu phí
  async getListVehicleTypes() {
    await this._sharedDirectoryService.getListVehicleFee().toPromise().then(res => {
      if (res.mess.code == 1) {
        this.listVehicleType = res.data.listData.map(val => {
          return {
            code: val.id,
            value: val.name
          }
        })
      }
    })
  }
  // Tuyến
  async getListRoutes() {
    await this._sharedDirectoryService.getListRoutes().toPromise().then(res => {
      if (res.mess.code == 1) {
        this.listRoutes = res.data.listData;
      }
    })
  }
  // Đoạn
  async getStages() {
    await this._sharedDirectoryService.getStages().toPromise().then(res => {
      if (res.mess.code == 1) {
        this.listStages = res.data.listData;
      }
    })
  }
  // Trạm theo Loại thu phí mở
  async getStationsOpens() {
    await this._sharedDirectoryService.getStationsOpens().toPromise().then(res => {
      if (res.mess.code == 1) {
        this.listStationOpen = res.data.listData.map(val => {
          return {
            code: val.id,
            value: val.name
          }
        })
      }
    });
  }

  // Lấy làn đường
  async getLanesIn() {
    await this._sharedDirectoryService.getListLans().toPromise().then(res => {
      if (res.mess.code == 1) {
        this.listLaneOpen = res.data.listData.map(val => {
          return {
            code: val.id,
            value: val.name
          };
        });
      }
    });
  }
  handleSearchModelTrim() {
    if (!this.searchModel.ocsCode) {
      delete this.searchModel.ocsCode;
    } else {
      this.searchModel.ocsCode = this.searchModel.ocsCode.trim();
    }

    if (!this.searchModel.servicePlanTypeId) {
      delete this.searchModel.servicePlanTypeId;
    }
    if (!this.searchModel.scope) {
      delete this.searchModel.scope;
    }

    if (!this.searchModel.vehicleGroupId) {
      delete this.searchModel.vehicleGroupId;
    }
    if (!this.searchModel.routeId) {
      delete this.searchModel.routeId;
    }
    if (!this.searchModel.stageId) {
      delete this.searchModel.stageId;
    }
    if (!this.searchModel.stationId) {
      delete this.searchModel.stationId;
    }
    if (!this.searchModel.status) {
      delete this.searchModel.status;
    }
    this.searchModel.createDateFrom = this.createDateFrom ? moment(this.createDateFrom).format(COMMOM_CONFIG.DATE_FORMAT).toString() : null;
    this.searchModel.createDateTo = this.createDateTo ? moment(this.createDateTo).format(COMMOM_CONFIG.DATE_FORMAT).toString() : null;
    if (!this.searchModel.createDateFrom) {
      delete this.searchModel.createDateFrom;
    }
    if (!this.searchModel.createDateTo) {
      delete this.searchModel.createDateTo;
    }

    this.searchModel.approveDateFrom = this.approveDateFrom ? moment(this.approveDateFrom).format(COMMOM_CONFIG.DATE_FORMAT).toString() : null;
    this.searchModel.approveDateTo = this.approveDateTo ? moment(this.approveDateTo).format(COMMOM_CONFIG.DATE_FORMAT).toString() : null;
    if (!this.searchModel.approveDateFrom) {
      delete this.searchModel.approveDateFrom;
    }
    if (!this.searchModel.approveDateTo) {
      delete this.searchModel.approveDateTo;
    }
    this.searchModel.startDateFrom = this.startDateFrom ? moment(this.startDateFrom).format(COMMOM_CONFIG.DATE_FORMAT).toString() : null;
    this.searchModel.endDateTo = this.endDateTo ? moment(this.endDateTo).format(COMMOM_CONFIG.DATE_FORMAT).toString() : null;
    if (!this.searchModel.startDateFrom) {
      delete this.searchModel.startDateFrom;
    }
    if (!this.searchModel.endDateTo) {
      delete this.searchModel.endDateTo;
    }

    if (this.effect) {
      this.effect = 1;
    }

    if (this.expire) {
      this.expire = 2;
    }

    if ((!this.effect && !this.expire) || (this.effect && this.expire)) {
      this.searchModel.effId = '';
    } else {
      this.searchModel.effId = this.effect ? this.effect : this.expire;
    }
  }
  masterToggle(event) {
    !event.checked
      ? this.selection.clear()
      : this.listDataPrice.forEach(row => {
        if (row.status == STATUS_HANDLE.CHODUYET) {
          {
            this.selection.select(row);
          }
        }
      });
    this.dataModel.isAllSelected = (this.selection.selected.length === this.dataModel.dataSource.filter(x => x.status == STATUS_HANDLE.CHODUYET).length);
  }
  checkItem(item) {
    this.selection.toggle(item);
    this.dataModel.isAllSelected = (this.selection.selected.length === this.dataModel.dataSource.filter(x => x.status == STATUS_HANDLE.CHODUYET).length);
  }

  // xóa bản ghi theo list id
  deleteRecord(item) {
    const message = this.translateService.instant('policy.confirm.delete.price');
    const dialogData = new ConfirmBoldFormDialogModel(this.translateService.instant('common.button.confirm'), message, item.stationStagesId, '?', this.translateService.instant('common.button.delete'));
    const dialogRef = this.dialog.originalOpen(ConfirmDialogBoldFormComponent, {
      maxWidth: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        if (item.servicePlanId) {
          // nếu có trong db thì xóa gọi api
          this._ticketPricesService.deleteTicketPricesById(item.servicePlanId).subscribe(rs => {
            if (rs.mess.code == 1) {
              this.searchPriceList();
              this.toastr.success(this._translateService.instant('common.notify.save.success'));
            } else {
              this.toastr.warning(this._translateService.instant('common.notify.delete-price'));
            }
          });
        }
      }
    });
  }
  cancelApproval(item) {
    const message = this.translateService.instant('policy.confirm.cancel.price');

    const dialogData = new ConfirmBoldFormDialogModel(this.translateService.instant('common.button.confirm'), message, item.stationStagesId, '?');
    const dialogRef = this.dialog.originalOpen(ConfirmDialogBoldFormComponent, {
      maxWidth: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this._ticketPricesService.cancelApprovalTicketPricesById(item.servicePlanId).subscribe(rs => {
          if (rs.mess.code == 1) {
            this.toastr.success(this._translateService.instant('common.notify.save.success'));
            this.searchPriceList();
          } else {
            this.toastr.warning(this._translateService.instant('common.notify.fail'));
          }
        });
      }
    });
  }

  // Xuất excel
  exportFile() {
    this.handleSearchModelTrim();
    this.searchModelExcel = Object.assign({}, this.searchModel);
    delete this.searchModelExcel.startrecord;
    delete this.searchModelExcel.pagesize;
    this._ticketPricesService.exportExcel(this.searchModelExcel).subscribe(
      res => {
        const contentDisposition = res.headers.get('content-disposition');
        const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
        saveAs(res.body, filename);
      },
      err => {
        this.toastr.warning(this.translateService.instant('common.notify.fail'));
      }
    );
  }

  // Phê duyệt giá vé bảng cước
  approvalPrices() {
    if (this.selection.selected.length == 0) {
      this.toastr.warning(this._translateService.instant('pricelist.invalid.approval'));
      return;
    }
    this.processApprovalOrReject(1, 'approval');
  }

  // Tu choi
  processDenial() {
    if (this.selection.selected.length == 0) {
      this.toastr.warning(this._translateService.instant('pricelist.invalid.reject'));
      return;
    }
    this.showPopupDenial(null, BriefcaseDenialComponent);
  }

  showPopupDenial(record?, componentTemplate?) {
    if (this.selection.selected.length == 0) {
      this.toastr.warning(this._translateService.instant('pricelist.invalid.approval'));
      return;
    }
    const dialog = this.dialog.open({
      width: '70%',
      data: record,
    }, componentTemplate);

    dialog.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.processApprovalOrReject(0, 'reject', dialogResult.reason);
      }
    });
  }

  processApprovalOrReject(type: number, controller: string, reason?: string) {
    let message: string;
    if (type == 1)
      message = this.translateService.instant('policy.confirm.approve.price');
    else
      message = this.translateService.instant('policy.confirm.deny.price');

    const servicePlanListName = [];

    this.servicePlanListId = [];
    // xu ly mapping param
    this.selection.selected.forEach(element => {
      if (element.status == STATUS_HANDLE.CHODUYET) {
        this.servicePlanListId.push(element.servicePlanId);
        servicePlanListName.push(element.stationStagesId);
      }
    });

    const dialogData = new ConfirmBoldFormDialogModel(this.translateService.instant('common.button.confirm'), message, servicePlanListName.join('", "'), '?');
    const dialogRef = this.dialog.originalOpen(ConfirmDialogBoldFormComponent, {
      maxWidth: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        if (type == 1) {
          this.body = {
            servicePlanIdList: this.servicePlanListId
          };
        } else {
          this.body = {
            servicePlanIdList: this.servicePlanListId,
            note: reason
          };
        }

        this._ticketPricesService.approvalOrRejectTicketPrices(this.body, controller).subscribe(res => {
          this.selection.clear()
          if (res.mess.code == 1) {
            this.servicePlanListId = [];
            this.toastr.success(this._translateService.instant('common.notify.save.success'));
            this.searchPriceList();
          } else {
            this.toastr.error(this._translateService.instant('common.notify.delete-price'));
          }
        });
      }
    });
  }
}
