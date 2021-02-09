import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { MtxDialog } from '@ng-matero/extensions';
import { RESOURCE } from '@app/core';
import { CommonCRMService, SharedDirectoryService } from '@app/shared';
import { SCOPE } from '@app/shared/constant/common.constant';
import { MtxGridColumn } from '@ng-matero/extensions';
import { SelectOptionModel } from '@app/core/models/common.model';
import { MatTable } from '@angular/material/table';
import { AttachFileComponent } from '@app/shared/components/attach-file/attach-file.component';
import { ConfirmDialogModel, ConfirmDialogComponent,} from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { DataService, TicketPricesService } from '@app/core/services/policy/ticket-prices.service';
import moment from 'moment';
import { COMMOM_CONFIG } from '@env/environment';
import { ValidationService } from '@app/shared/common/validation.service';
import { CanComponentDeactivate } from '@app/core/guards/can-dead-active';
import { Observable } from 'rxjs';
import { ConfirmCloseDialogComponent } from '@app/shared/components/confirm-close-dialog/confirm-close-dialog.component';
import { ConfirmCloseDialog } from '@app/shared/models/confirm-close-dialog';
import { ChangeDetectionStrategy } from '@angular/core';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'add-pricelist',
  templateUrl: './add-new-pricelist.component.html',
  styleUrls: ['./add-new-pricelist.component.css'],
})
export class AddNewComponent extends BaseComponent implements OnInit {
  formSave: FormGroup;
  checkbox = 'false';
  listTicketPriceTypes = [];
  listVehicleType = [];
  listStationOpen = [];
  listStationType = [];
  listStationclose = [];
  listFile = [];
  botRevenueShareList = [];
  value: { botId: ''; botName: ''; botRevenue: '' };
  columnsFile: MtxGridColumn[];
  displayedColumnsFile: string[] = ['orderNumberChungTu', 'documentName', 'actions'];
  listOptionLicense: SelectOptionModel[] = [] as SelectOptionModel[];
  listDataProfileRefresh = [];
  startDate = null;
  endDate = null;
  listScope = [];
  scope = SCOPE;
  dataLanesIn: any;
  dataLanesOut: any;
  dataOptionStages: any;
  distanceType: string;
  listBots = [];
  listBotMaps: any[];
  botId = [];
  botName: string[];
  botRevenue: any;
  servicePlanId: number;
  totalBotRevenue = 0;
  @ViewChild('tableFile') tableFile: MatTable<any>;
  minDate = new Date();
  _methodChargeId: any;
  _routeId: any;

  _stationInputId: any;
  _stationOutputId: any;

  constructor(
    public actr: ActivatedRoute,
    private fb: FormBuilder,
    // sau sua lai theo sevice khac
    protected translateService: TranslateService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
    public _commonCRMService?: CommonCRMService,
    public _sharedDirectoryService?: SharedDirectoryService,
    public _ticketPricesService?: TicketPricesService,
    public _router?: Router,
    private dataSender?: DataService,
  ) {
    super(actr, RESOURCE.CUSTOMER);
    this.columnsFile = [
      { i18n: 'common.orderNumber', field: 'orderNumberChungTu' },
      { i18n: 'pricelist-add.file-attach', field: 'documentName' },
      { i18n: 'common.action', field: 'actions' },
    ];
    // phạm vi áp dụng
    this.listScope = [
      { value: SCOPE.TRAM, label: this.translateService.instant('contract.billing.station') },
      { value: SCOPE.DOAN, label: this.translateService.instant('buyTicket.distance_type') },
      // { value: SCOPE.TOANQUOC, label: this.translateService.instant('pricelist.nationwide') },
    ];
    this.dataModel.scope = this.listScope[0].value;
  }

  buildForm() {
    this.formSave = this.fb.group({
      servicePlanCode: [
        '',
        [Validators.required, Validators.maxLength(20), ValidationService.cannotWhiteSpace],
      ], // mã giá vé
      servicePlanTypeId: ['', Validators.required], // Loại vé
      scope: ['', Validators.required], // phạm vi áp dụng
      vehicleGroupId: ['', Validators.required], // Loại phương tiện thu phí
      stationType: [''], // Loại trạm
      stationId: ['', Validators.required], // Trạm
      stageId: [''], // Đoạn
      laneIn: [''], // Làn vào
      laneOut: [''], // Làn ra
      fee: [
        '',
        [
          Validators.required,
          Validators.max(999999999999999),
          Validators.min(1),
          Validators.pattern(COMMOM_CONFIG.SEAT_NUMBER_FORMAT),
        ],
      ], // giá cước
      ocsCode: [
        '',
        [Validators.required, Validators.maxLength(50), ValidationService.cannotWhiteSpace],
      ], // mã ocs code
      startDate: ['', Validators.required], // ngày hiệu lực từ ngày
      endDate: [''], // đến ngày
      description: ['', [Validators.maxLength(1024), ValidationService.cannotWhiteSpace]], // ghi chú
      autoRenew: [''], // Gói phép cho phép gia hạn
      useDay: [''], // chu kỳ gia hạn
    });
  }
  ngOnInit() {
    this.buildForm();
    this.formSave.valueChanges.subscribe(res => {
      {
        if(this.formSave.dirty) this.dataSender.changeMessage('dirty');
      }
    });
    this.dataModel.ratesRenewal = true;
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'pricelist-add.list_bot', field: 'name' },
      { i18n: 'pricelist-add.share-amount-monney', field: 'botRevenue' },
    ];
    super.mapColumn();
    this.servicePlanId = Number(this.actr.snapshot.paramMap.get('servicePlanId'));
    this.bindData();
  }
  async bindData() {
    await this.getListTicketPriceTypes();
    await this.getListVehicleTypes();
    await this.getListStationsOpens();
    await this.getStationTypes();
    await this.getListStages();
    await this.getDetail();

    this.formSave.get('autoRenew').valueChanges.subscribe(res => {
      if (res) {
        this.formSave.controls.useDay.setValidators(Validators.required);
        this.formSave.controls.useDay.updateValueAndValidity();
      } else {
        this.formSave.controls.useDay.clearValidators();
        this.formSave.controls.useDay.updateValueAndValidity();
      }
    });
  }

  // Loại vé
  getListTicketPriceTypes() {
    this._commonCRMService.getTicketPriceTypes().subscribe(res => {
      if (res.mess.code == 1) {
        this.listTicketPriceTypes = res.data.listData.map(val => {
          return {
            code: val.servicePlanTypeId,
            value: val.name,
          };
        });
      }
    });
  }
  // Loại phương tiện thu phí
  async getListVehicleTypes() {
    const x = await this._sharedDirectoryService.getListVehicleFee().toPromise();
    this.listVehicleType = x.data.listData.map(val => {
      return {
        code: val.id,
        value: val.name,
      };
    });
  }

  // Loại phương tiện thu phí
  async getListVehicleTypesRachMieu() {
    const x = await this._sharedDirectoryService.getListVehicleFeeRachMieu().toPromise();
    this.listVehicleType = x.data.listData.map(val => {
      return {
        code: val.id,
        value: val.name,
      };
    });
  }
  // get loại trạm
  async getStationTypes() {
    await this._sharedDirectoryService
      .getStationType()
      .toPromise()
      .then(res => {
        if (res.mess.code == 1) {
          this.listStationType = res.data.map(val => {
            return {
              id: Number(val.code),
              name: val.val,
            };
          });
          this.formSave.controls.stationType.setValue(this.listStationType[1].id);
        }
      });
  }
  // Trạm theo Loại trạm mở
  getListStationsOpens() {
    this._sharedDirectoryService.getStationsOpens().subscribe(res => {
      if (res.mess.code == 1) {
        this.listStationOpen = res.data.listData.map(val => {
          return {
            code: val.id,
            value: val.name,
          };
        });
      }
    });
  }
  // Lấy danh sách đoạn đường
  getListStages() {
    this._sharedDirectoryService.getStages().subscribe(res => {
      if (res.mess.code == 1) {
        this.dataOptionStages = res.data.listData;
      }
    });
  }

  selectionChangeStation(value) {
    if(value.code == 5018)
      this.getListVehicleTypesRachMieu();
    else
      this.getListVehicleTypes();
    if (value.code) {
      this.getStationDetail(value.code, 1, true, true);
    }
  }
  // lấy danh sách bots theo id trạm
  async getStationDetail(stationId, type, getBot, saveChargeMethodIdAndRouteId) {
    // mac dinh la get lane
    let data = (await this._sharedDirectoryService.getStationsDetail(stationId).toPromise()).data;
    this.botRevenueShareList = [];
    if (type == 1) {
      this.dataLanesOut = data.laneList;
    } else {
      this.dataLanesIn = data.laneList;
    }
    if (getBot) {
      this.listBots = data.botList.filter(x => x.is_active == '1');
      this.totalRecord = data.botList.filter(x => x.is_active == '1').length;
    }
    if (saveChargeMethodIdAndRouteId) {
      this._methodChargeId = Number(data.method_charge_id);
      this._routeId = Number(data.route_id);
    }
  }

  selectionChangeScope(value) {
    if(this.dataModel.scope == this.scope.DOAN) this.getListVehicleTypes();
    this.listBots = [];
    this.dataLanesIn = [];
    this.dataLanesOut = [];
    this.dataModel.stageId = null;
    this._stationInputId = null;
    this._stationOutputId = null;
    this.setValidate(value);
  }

  setValidate(value) {
    if (value == SCOPE.DOAN) {
      this.formSave.controls.stationType.setValue(this.listStationType[0].id);
      this.formSave.controls.stationId.clearValidators();
      this.formSave.controls.stationId.updateValueAndValidity();
      this.formSave.controls.stageId.setValidators(Validators.required);
      this.formSave.controls.stageId.updateValueAndValidity();
    } else if (value == SCOPE.TRAM) {
      this.formSave.controls.stationType.setValue(this.listStationType[1].id);
      this.formSave.controls.stationId.setValidators(Validators.required);
      this.formSave.controls.stationId.updateValueAndValidity();
      this.formSave.controls.stageId.clearValidators();
      this.formSave.controls.stageId.updateValueAndValidity();
    } else if (value == SCOPE.TOANQUOC) {
    }
  }

  resetForm() {
    if (this.servicePlanId) {
      this.getDetail();
      this.selectionChangeScope(this.listScope[0].value);
      this.listBots = [];
      this.listFile = [];
      this.totalRecord = 0;
    } else {
      this.formSave.reset();
      this.formSave.controls.scope.setValue(this.listScope[0].value);
      this.selectionChangeScope(this.listScope[0].value);
      this.listBots = [];
      this.listFile = [];
      this.totalRecord = 0;
      this.startDate = new Date();
    }
  }

  async selectionChangeStages(value) {
    if (value.id) {
      this.dataLanesIn = [];
      this.dataLanesOut = [];
      await this.getStagesDetail(value.id, true, true);
    }
  }

  async getStagesDetail(stagesId, getbot, saveChargeMethodIdAndRouteId) {
    let data = (await this._sharedDirectoryService.getStagesDetail(stagesId).toPromise()).data;
    await this.getStationDetail(data.station_input_id, 0, false, false);
    await this.getStationDetail(data.station_output_id, 1, false, false);
    this._stationInputId = data.station_input_id;
    this._stationOutputId = data.station_output_id;
    if (getbot) {
      this.listBots = data.botList.filter(x => x.is_active == '1');
      this.totalRecord = data.botList.filter(x => x.is_active == '1').length;
    }
    if (saveChargeMethodIdAndRouteId) {
      this._routeId = Number(data.route_id);
      this._methodChargeId = Number(data.method_charge_id);
    }
  }

  removeSelectedFile(item, i) {
    if (item.attachmentFileId) {
      const dialogData = new ConfirmDialogModel(
        this.translateService.instant('common.confirm.title.delete'),
        this.translateService.instant('common.confirm.delete')
      );

      const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
        maxWidth: '400px',
        data: dialogData,
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // nếu có trong db thì xóa gọi api
          this._ticketPricesService
            .deleteProfilesTicketPrices(item.attachmentFileId)
            .subscribe(rs => {
              if (rs.mess.code == 1) {
                dialogRef.close();
                this.listFile.splice(i, 1);
                this.listDataProfileRefresh.splice(i, 1);
                this.tableFile.renderRows();
                this.toastr.success(this.translateService.instant('common.notify.save.success'));
              } else {
                this.toastr.warning(this.translateService.instant('common.notify.fail'));
              }
            });
        }
      });
    } else {
      this.listFile.splice(i, 1);
      this.listDataProfileRefresh.splice(i, 1);
      this.tableFile.renderRows();
    }
  }

  downLoadFile(item) {
    this._ticketPricesService.downloadProfileTicketPrices(item.attachmentFileId).subscribe(
      data => {
        saveAs(data, item.documentName);
      },
      err => {
        this.toastr.warning(this.translateService.instant('common.notify.fail'));
      }
    );
  }

  chooseFileChange(event) {
    this.chooseFileModal(event, AttachFileComponent);
  }
  chooseFileModal(record?, componentTemplate?) {
    const dialog = this.dialog.open(
      {
        width: '600px',
        data: { record },
      },
      componentTemplate
    );

    dialog.afterClosed().subscribe(res => {
      if (res) {
        res.forEach(file => {
          const license = {
            documentName: file.fileName,
            fileName: file.fileName,
            fileSize: file.fileSize,
            fileBase64: file.fileBase64,
          };
          this.listDataProfileRefresh.push(license);
          this.listFile.push(license);
        });
        this.tableFile.renderRows();
      }
    });
  }

  // thêm mới giá vé
  onSavePrice() {
    this.totalBotRevenue = 0;
    this.botRevenueShareList = []; // trungdq16: fix reset listBotRevenueShareList truoc khi push data vao
    this.listBots.forEach(element => {
      if (!element.botRevenue && element.botRevenue != 0) {
        //   this.toastr.warning(this.translateService.instant('pricelist.invalid.bot-revenue'));
        //   return false;
      } else {
        this.totalBotRevenue += Number(element.botRevenue);
        const tmp = { botId: element.id, botName: element.name, botRevenue: element.botRevenue };
        this.botRevenueShareList.push(tmp);
      }
    });
    if (this.dataModel.fee != this.totalBotRevenue && this.listBots.length > 0) {
      this.toastr.warning(this.translateService.instant('pricelist.invalid.bot-revenue'));
      return;
    }

    this.dataModel.startDate = this.startDate
      ? moment(this.startDate).format(COMMOM_CONFIG.DATE_FORMAT)
      : null;
    this.dataModel.endDate = this.endDate
      ? moment(this.endDate).format(COMMOM_CONFIG.DATE_FORMAT)
      : null;
    const body = {
      servicePlanCode: this.dataModel.servicePlanCode.trim(),
      servicePlanTypeId: this.dataModel.servicePlanTypeId,
      scope: this.dataModel.scope,
      vehicleGroupId: this.dataModel.vehicleGroupId,
      stationType: this.dataModel.stationType,
      stationId: this.dataModel.stationId,
      stageId: this.dataModel.stageId,
      laneIn: this.dataModel.laneIn,
      laneOut: this.dataModel.laneOut,
      fee: this.dataModel.fee,
      ocsCode: this.dataModel.ocsCode.trim(),
      startDate: this.dataModel.startDate,
      endDate: this.dataModel.endDate,
      description: !this.dataModel.description ? null : this.dataModel.description.trim(),
      autoRenew: !this.dataModel.autoRenew ? 0 : 1,
      useDay: this.dataModel.useDay,
      botRevenueShareList: this.botRevenueShareList,
      attachmentFileDTOS:
        this.listDataProfileRefresh.length > 0 ? this.listDataProfileRefresh : null,
      chargeMethodId: this._methodChargeId,
      routeId: this._routeId,
      stationInId: Number(this._stationInputId),
      stationOutId: Number(this._stationOutputId),
    };
    if (this.servicePlanId) {
      if (body.scope == SCOPE.TRAM) {
        body.stageId = null;
      } else if (body.scope == SCOPE.DOAN) {
        body.stationId = null;
      }
      this._ticketPricesService.updateTicketPrices(body, this.servicePlanId).subscribe(res => {
        switch (res.mess.code) {
          case 1: {
            this.formSave.markAsPristine();
            this.toastr.success(this.translateService.instant('common.notify.save.success'));
            this.onBack();
            break;
          }
          case 12: {
            this.toastr.error(this.translateService.instant('pricelist-add.error.price.code'));
            break;
          }
          default:
            this.toastr.error(this.translateService.instant('common.notify.fail'));
        }
      });
    } else {
      this._ticketPricesService.addNewTicketPrices(body).subscribe(res => {
        switch (res.mess.code) {
          case 1: {
            this.toastr.success(this.translateService.instant('common.notify.save.success'));
            this.onBack();
            break;
          }
          case 7: {
            this.toastr.error(this.translateService.instant('common.notify.mess-error'));
            break;
          }
          case 12: {
            this.toastr.error(this.translateService.instant('pricelist-add.error.price.code'));
            break;
          }
          default:
            this.toastr.error(this.translateService.instant('common.notify.fail'));
        }
      });
    }
  }

  onBack() {
    this._router.navigate(['policy', 'pricelist']);
  }

  async getDetail() {
    if (this.servicePlanId) {
      const x = await this._ticketPricesService
        .findTicketPricesById(this.servicePlanId)
        .toPromise();
      if (x.data.botRevenueShareList)
        this.listBots = x.data?.botRevenueShareList.map(val => {
          return {
            id: val.botId,
            name: val.botName,
            botRevenue: val.botRevenue,
          };
        });

      this.listFile = x.data.attachmentFileDTOS ? x.data.attachmentFileDTOS : [];
      this.totalRecord = this.listBots.length;
      this.dataModel.servicePlanCode = x.data?.servicePlanCode;
      this.dataModel.servicePlanTypeId = x.data?.servicePlanTypeId;
      this.dataModel.scope = x.data?.scope;
      this.dataModel.vehicleGroupId = x.data?.vehicleGroupId;
      this.dataModel.stationType = x.data?.stationType;
      this.dataModel.stationId = x.data?.stationId;
      this.dataModel.stageId = x.data?.stageId;
      this.dataModel.laneIn = x.data?.laneIn;
      this.dataModel.laneOut = x.data?.laneOut;
      this.dataModel.fee = x.data?.fee;
      this.dataModel.ocsCode = x.data?.ocsCode;
      // this.dataModel.startDate = moment(x.data?.startDate, COMMOM_CONFIG.DATE_FORMAT).format();
      this.startDate = moment(x.data?.startDate, COMMOM_CONFIG.DATE_FORMAT).format();
      // this.dataModel.endDate = x.data?.endDate ? moment(x.data?.endDate, COMMOM_CONFIG.DATE_FORMAT).toDate() : null;
      this.endDate = x.data?.endDate
        ? moment(x.data?.endDate, COMMOM_CONFIG.DATE_FORMAT).format()
        : null;
      this.dataModel.description = x.data?.description;
      this.dataModel.autoRenew = x.data?.autoRenew;
      this.dataModel.useDay = x.data?.useDay;
      this._methodChargeId = x.data?.chargeMethodId;
      this._routeId = x.data?.routeId;

      this.setValidate(this.dataModel.scope);
      if (this.dataModel.scope == SCOPE.DOAN) {
        this.getStagesDetail(this.dataModel.stageId, false, true);
        this._stationInputId = x.data?.stationInId;
        this._stationOutputId = x.data?.stationOutId;
      } else if (this.dataModel.scope == SCOPE.TRAM) {
        this.getStationDetail(this.dataModel.stationId, 1, false, true);
      }
    }
  }
}
