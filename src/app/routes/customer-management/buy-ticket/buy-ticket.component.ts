import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ContractService, RESOURCE, VehicleService } from '@app/core';
import { AppStorage } from '@app/core/services/AppStorage';
import { CommonCRMService } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { CrmTableComponent } from '@app/shared/components/table-component/table-component.component';
import { ACTION_TYPE, BUY_TICKET, HTTP_CODE, PAYCHARGE, QUARTER_YEAR, TICKET_TYPE } from '@app/shared/constant/common.constant';
import { SharedDirectoryService } from '@app/shared/services/shared-directory.service';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions/dialog';
import { TranslateService } from '@ngx-translate/core';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

const moment = _rollupMoment || _moment;

export interface PeriodicElement {
  number: string;
  position: number;
  car_style: string;
}

@Component({
  selector: 'buyTicket',
  templateUrl: './buy-ticket.component.html',
  styleUrls: ['./buy-ticket.component.scss']
})
export class BuyTicketComponent extends BaseComponent implements OnInit, AfterViewChecked {
  constructor(
    public actr: ActivatedRoute,
    private _crmCommonService: CommonCRMService,
    protected _translateService: TranslateService,
    private _vehiclesRFID: VehicleService,
    private _contractInfoService: ContractService,
    private _customeBuyticket: SharedDirectoryService,
    private fb: FormBuilder,
    protected translateService: TranslateService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
    private cdr?: ChangeDetectorRef,
  ) {
    super(actr, _vehiclesRFID, RESOURCE.CUSTOMER);

    this.columns = [
      {
        i18n: 'exchangeHistory.stt', field: 'orderNumber', disabled: true
      },
      {
        i18n: 'buyTicket.plateNumber', field: 'number', disabled: true
      },
      {
        i18n: 'exchangeHistory.tram_doan', field: 'distance_type', disabled: true
      },
      {
        i18n: 'exchangeHistory.type_ticket', field: 'ticket', disabled: true
      },
      { i18n: 'buyTicket.calculation', field: 'calculation', disabled: true },
      {
        i18n: 'exchangeHistory.money', field: 'total_money', disabled: true
      },
      {
        i18n: 'buyTicket.signDate', field: 'date_register', disabled: true
      },
      {
        i18n: 'buyTicket.startTime', field: 'start_date', disabled: true
      },
      {
        i18n: 'exchangeHistory.endTime', field: 'end_date', disabled: true
      },
      {
        i18n: 'exchangeHistory.ghtd', field: 'automaticRenewal', disabled: true
      },
      {
        i18n: 'buyTicket.status', field: 'status', disabled: true
      },
      {
        i18n: 'buyTicket.action', field: 'option', disabled: true
      },
    ];
  }
  ngAfterViewChecked(): void {
    this.cdr.detectChanges();
  }
  displayedColumns: string[] = ['select', 'number', 'car_style'];
  buyTicketColumns: string[] = ['orderNumber', 'number', 'distance_type', 'ticket', 'calculation', 'total_money', 'date_register', 'start_date', 'end_date', 'automaticRenewal', 'status', 'option'];
  selection = new SelectionModel<any>(true, []);
  dataOptionStationType = [];
  dataOptionStages = [];
  dataOptionStations = [];
  dataLanesOut: any;
  dataLanesIn: any;
  dataOptionTicket = [];
  dataMethodCharges = [];
  methodCharges: number;
  isDisabledLaneIn = false;
  isHiddenTime = false;
  isHiddenDay = true;
  isHiddenQuarter = false;
  showStations = false;
  showStages = true;
  listVehicles = [];
  totalCount: number;
  oldData = [];
  dataBuyTicket = [];
  stationType: string;
  distanceType: string;
  stations: string;
  ticket: string;
  statusActive: string[] = ['Không hoạt động', 'Hoạt động'];
  automaticRenewal: boolean;
  @ViewChild('tableBuyticket') tableBuyticket: CrmTableComponent;
  checkValidPayment = true;
  public show = false;
  public buttonName: any = 'Show';
  formInformation: FormGroup;
  states = [];
  stationTypeId = 0;
  stagesId: number;
  vehiclesGroupId = [];
  plateNumberArr = [];
  balance = 0;
  list = [];
  selectedContract: any = {};
  listFeeByVehicleGroupId = [];
  listServicePlanFee: any = {};
  listQuarterOfYear = [];
  listQuarter = [];
  listMonthOfYear = [];
  yearMm = (new Date()).getFullYear();
  startDate: any;
  endDate: any;
  monthMoment;
  checkValidTiket = true;
  starttranform;
  endtranform;
  isDisableStart = true;
  disabledStages = false;
  disableMonthQuarter = true;
  checkLane = false;
  subscription: Subscription;
  isLoadingAuto: boolean;

  // Add param booCode
  booCode: string;
  booCodeStage: string;
  servicePlanDTOList = [];

  birthday: Date;
  maxBirthday = new Date();

  paymentDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
  minPaymentDate = new Date();

  departDate: Date;
  returnDate: Date;
  minTripDate = new Date();
  maxTripDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  startTripDate = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);
  appointmentDate: Date;
  minAppointmentDate = new Date();
  maxAppointmentDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  caculator = BUY_TICKET
  ngOnInit() {
    this.dataModel.vehicleGroupOpts = AppStorage.get('vehicle-group');
    this.formInformation = this.fb.group({
      code: [''],
      name: [''],
      customer_code: [''],
      account_balances: [''],
      available_balances: [''],
      custody_balance: [''],
      station_type: ['', Validators.required],
      stages: [''],
      stations: [''],
      ticket: ['', Validators.required],
      calculation: [''],
      total_money: [''],
      total_ticket: [''],
      OTP_code: [''],
      lane_in: [''],
      lane_out: [''],
      searchPlate: [''],
      timestampOutFrom: [''],
      timestampOutTo: [''],
      etc_charge: [''],
      quarter: [''],
      choose_year: [''],
      monthQuarter: [''],
      month: [''],
      pagesize: [''],
      startrecord: [''],
      contractNumber: ['', Validators.required]
    });

    this.getStationType();
    this.getStages();
    this.getTicketType();
    this.getListDataYear();
    this.changeValueCheckbox();
    this.dataFormInforChange();

  }

  changeValueCheckbox() {
    this.selection.changed.subscribe(res => {
      if (this.selection.selected.length > 0 && this.formInformation.valid && this.formInformation.controls.calculation.value) {
        this.checkValidTiket = false;
      } else {
        this.checkValidTiket = true;
      }
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.listVehicles ? this.listVehicles.length : 0;
    return numSelected === numRows;
  }

  getListDataYear() {
    for (let index = 0; index < 10; index++) {
      const yearmm = this.yearMm + index;
      this.listQuarterOfYear.push(yearmm);
    }
  }

  getListTimeData(value) {
    this.formInformation.controls.month.setValue(null);
    if (value) {
      this.listMonthOfYear = [];
      this.listQuarter = [];
      this.disableMonthQuarter = false;
      const currenYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const currentQuarter = Math.ceil(currentMonth / 3);
      let ii = 1;
      let quarter = 1;
      if (currenYear == value) {
        ii = currentMonth;
        quarter = currentQuarter;
      }
      for (let i = ii; i <= 12; i++) {
        this.listMonthOfYear.push(i);
      }
      for (let i = quarter; i <= 4; i++) {
        this.listQuarter.push(i);
      }
    }
  }

  dataFormInforChange() {
    this.formInformation.valueChanges.subscribe(value => {
      if (value) {
        if (this.formInformation.valid && this.selection.selected.length > 0 && this.formInformation.controls.calculation.value) {
          this.checkValidTiket = false;
        } else {
          this.checkValidTiket = true;
        }
        if (value.etc_charge != '' && this.dataBuyTicket.length > 0) {
          this.checkValidPayment = false;
        } else {
          this.checkValidPayment = true;
        }
      }
    });
  }

  setValidate(type) {
    if (type == BUY_TICKET.TRAM_KIN) {
      this.formInformation.controls.stages.setValidators(Validators.required);
      this.formInformation.controls.stages.updateValueAndValidity();
      this.formInformation.controls.stations.clearValidators();
      this.formInformation.controls.stations.updateValueAndValidity();

    } else if (type == BUY_TICKET.TRAM_MO) {
      this.formInformation.controls.stations.setValidators(Validators.required);
      this.formInformation.controls.stations.updateValueAndValidity();
      this.formInformation.controls.stages.clearValidators();
      this.formInformation.controls.stages.updateValueAndValidity();
    }
  }

  setValidateByTicketType(calculation, tiketType) {
    if (calculation == BUY_TICKET.TINH_BLOCK) {
      this.formInformation.controls.timestampOutFrom.setValidators(Validators.required);
      this.formInformation.controls.timestampOutFrom.updateValueAndValidity();
      this.formInformation.controls.quarter.clearValidators();
      this.formInformation.controls.quarter.updateValueAndValidity();
      this.formInformation.controls.choose_year.clearValidators();
      this.formInformation.controls.choose_year.updateValueAndValidity();
      this.formInformation.controls.month.clearValidators();
      this.formInformation.controls.month.updateValueAndValidity();
    } else if (calculation == BUY_TICKET.TINH_THUONG) {
      this.formInformation.controls.timestampOutFrom.clearValidators();
      this.formInformation.controls.timestampOutFrom.updateValueAndValidity();
      this.formInformation.controls.choose_year.setValidators(Validators.required);
      this.formInformation.controls.choose_year.updateValueAndValidity();
      if (tiketType == TICKET_TYPE.VE_THANG) {
        this.formInformation.controls.month.setValidators(Validators.required);
        this.formInformation.controls.month.updateValueAndValidity();
        this.formInformation.controls.quarter.clearValidators();
        this.formInformation.controls.quarter.updateValueAndValidity();
      } else if (tiketType == TICKET_TYPE.VE_QUY) {
        this.formInformation.controls.quarter.setValidators(Validators.required);
        this.formInformation.controls.quarter.updateValueAndValidity();
        this.formInformation.controls.month.clearValidators();
        this.formInformation.controls.month.updateValueAndValidity();
      }
    }
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.listVehicles.forEach(row => this.selection.select(row));
  }
  checkItem(item) {
    this.selection.toggle(item);
  }

  onGetMonth(event) {
    this.monthMoment = event;
  }
  async getTicket() {
    await this.getFee();
    const m = this.dataBuyTicket.map(x => x.total_money ?? 0);
    this.formInformation.controls.total_money.setValue(m.reduce((x, y) => x + y, 0));
  }

  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  async filter() {
    if (this.formInformation.controls.contractNumber.value.trim()) {
      const rs = (await this._contractInfoService.searchContractInfo(this.formInformation.controls.contractNumber.value.trim()).toPromise());
      if (rs.mess.code == HTTP_CODE.SUCCESS && rs.data.listData.length > 0) {
        this.selectedContract = rs.data.listData[0];
        this.selectedContract.signDate = this.selectedContract.signDate ? this.selectedContract.signDate.split(' ')[0] : null;
        this.selectedContract.effDate = this.selectedContract.effDate ? this.selectedContract.effDate.split(' ')[0] : null;
        this.selectedContract.expDate = this.selectedContract.expDate ? this.selectedContract.expDate.split(' ')[0] : null;
        await this.getListVehicle();
        await this.getBalance();
        this.dataBuyTicket = [];
        this.tableBuyticket.renderTable();
        this.selection.clear();
      }
    }
  }
  onPageChange(event) {
    this.formInformation.controls.startrecord.setValue(event.pageIndex);
    this.formInformation.controls.pagesize.setValue(event.pageSize);
  }

  payCharge() {
    const message = this._translateService.instant('common.confirm.pay_mess');

    const dialogData = new ConfirmDialogModel(
      this._translateService.instant('common.confirm.pay'),
      message
    );

    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.list = [];
        this.dataBuyTicket.forEach(element => {
          const servicePlanTypeId = this.dataOptionTicket.find(x => x.name == element.ticket);
          const chargeMethodId = this.dataMethodCharges.find(x => x.val == element.calculation);
          let autoRenew;
          if (element.automaticRenewal == 'Có') {
            autoRenew = element.automaticRenewal = 1;
          } else {
            autoRenew = element.automaticRenewal = 0;
          }

          this.list.push({
            plateNumber: element.plateNumber,
            stationId: element.stationId,
            vehicleId: element.vehicleId,
            vehiclesGroupId: element.vehicleGroupId,
            stageId: element.stagesId,
            price: element.total_money,
            effDate: moment(element.start_date).format(COMMOM_CONFIG.DATE_TIME_FORMAT),
            expDate: moment(element.end_date).format(COMMOM_CONFIG.DATE_TIME_EXPIRE_FORMAT),
            quantity: PAYCHARGE.QUANTITY,
            autoRenew,
            laneOut: element.laneOut,
            chargeMethodId: chargeMethodId ? chargeMethodId.code : null,
            servicePlanTypeId: servicePlanTypeId ? servicePlanTypeId.servicePlanTypeId : null,
            booCode: element.booCode,
            stationType: element.stationType,
            vehicleTypeId: element.vehicleTypeId,
            netWeight: element.netWeight,
            cargoWeight: element.cargoWeight,
            seatNumber: element.seatNumber,
            epc: element.epc
          });
        });
        const o = this.formInformation.controls.total_money.value ? Number(this.formInformation.controls.total_money.value) : 0;
        const body = {
          acountETC: this.formInformation.get('etc_charge').value ? 'true' : 'false',
          contractNo: this.selectedContract.contractNo,
          amount: o,
          actTypeId: ACTION_TYPE.MUA_VE_THANG_QUY,
          quantity: this.list.length,
          list: this.list
        };

        this._vehiclesRFID.getBuyTicketCharge(this.selectedContract.custId, this.selectedContract.contractId, body).subscribe(res => {
          this.dataBuyTicket = [];
          this.selection.clear();
          this.formInformation.controls.total_money.setValue(0);
          this.tableBuyticket.renderTable();
          if (res.mess.code == HTTP_CODE.SUCCESS) {
            if (res.data.listFail.length) {
              res.data.listFail.forEach(element => {
                let stagesName;
                let stationName;
                stagesName = this.dataOptionStages.find(x => x.id == element.stageId)?.name;
                stationName = this.dataOptionStations.find(x => x.id == element.stationId)?.name;
                stagesName = stagesName ? stagesName : '';
                stationName = stationName ? stationName : '';
                this.toastr.error(this._translateService.instant('buyTicket.notifiError') + `${element.plateNumber}`
                  + this._translateService.instant('buyTicket.notifiError1') + `${element.epc}`
                  + this._translateService.instant('buyTicket.notifiError2') + `${this.dataOptionTicket.find(x => x.servicePlanTypeId == element.servicePlanTypeId)?.name}`
                  + this._translateService.instant('buyTicket.notifiError3') + `${element.createDateFrom}`
                  + this._translateService.instant('buyTicket.notifiError4') + `${element.createDateTo}`
                  + this._translateService.instant('buyTicket.notifiError5') + `${stagesName}` + `${stationName}`, null, {
                  closeButton: true,
                  disableTimeOut: true
                });
              });
            } else {
              this.toastr.success(this._translateService.instant('common.pay_success'));
            }
            this.getBalance();
          } else {
            this.toastr.error(res.mess.description);
          }
        });
      }
    });
  }

  // toggle() {
  //   this.show = !this.show;
  //   if (this.show) this.buttonName = 'Hide';
  //   else this.buttonName = 'Show';
  // }

  getStationType() {
    this._customeBuyticket.getStationType().subscribe(res => {
      this.dataOptionStationType = AppStorage.get('station-type');
      this.formInformation.controls.station_type.setValue(this.dataOptionStationType[0].code);
      this.setValidate(this.formInformation.value.station_type);
    });
  }

  getStages() {
    this._customeBuyticket.getStagesCRM().subscribe(res => {
      this.dataOptionStages = res.data.listData;
    });
  }

  getStations() {
    this._customeBuyticket.getStationsOpens().subscribe(res => {
      this.dataOptionStations = res.data.listData;
    });
  }

  getTicketType() {
    this._crmCommonService.getTicketPriceTypes().subscribe(res => {
      this.dataOptionTicket = res.data.listData.filter(x => x.servicePlanTypeId == 4 || x.servicePlanTypeId == 5);
    });
  }

  getMethodCharges(methodchargesId) {
    this._customeBuyticket.getMethodCharges(methodchargesId).subscribe(res => {
      if (res.data.length) {
        this.dataMethodCharges = res.data;
        this.formInformation.controls.calculation.setValue(this.dataMethodCharges[0].code);
      }
    });
  }

  getValueStationType(value) {
    value = value.code;
    if (value) {
      this.disabledStages = false;
      this.formInformation.controls.ticket.patchValue('');
    }
    if (value == BUY_TICKET.TRAM_KIN) {
      this.showStages = true;
      this.showStations = false;
      this.dataOptionStages = [];
      this.dataOptionStations = [];
      this.dataLanesIn = [];
      this.dataLanesOut = [];
      this.getStages();
      this.setValidate(value);
      this.stationType = this.dataOptionStationType.filter(station => station.code == value)[0].val;
      this.dataMethodCharges = [];
      this.isDisabledLaneIn = false;
      this.formInformation.get('stages').patchValue('');
      this.formInformation.controls.timestampOutFrom.patchValue('');
      this.formInformation.controls.timestampOutTo.patchValue('');
    } else if (value == BUY_TICKET.TRAM_MO) {
      this.showStations = true;
      this.showStages = false;
      this.dataOptionStages = [];
      this.dataOptionStations = [];
      this.dataLanesIn = [];
      this.dataLanesOut = [];
      this.dataMethodCharges = [];
      this.getStations();
      this.setValidate(value);
      this.stationType = this.dataOptionStationType.filter(station => station.code == value)[0].val;
      this.isDisabledLaneIn = true;
      this.formInformation.get('stations').patchValue('');
    }
    this.stationTypeId = this.dataOptionStationType.filter(station => station.code == value)[0].id;

  }
  getValueDistanceType(value) {
    value = value.id;
    this.formInformation.controls.timestampOutFrom.patchValue('');
    this.formInformation.controls.timestampOutTo.patchValue('');
    this.formInformation.controls?.choose_year.patchValue(null);
    this.formInformation.controls?.month.patchValue(null);
    this.formInformation.controls?.quarter.patchValue(null);
    if (value) {
      this.formInformation.controls.ticket.patchValue('');
      this.formInformation.controls.calculation.patchValue('');
      this.distanceType = this.dataOptionStages.filter(station => station.id == value)[0].name;
      this.getStagesDetail(value);
      this.dataLanesIn = [];
      this.dataLanesOut = [];

    }
  }

  getStagesDetail(stagesId) {
    this._customeBuyticket.getStagesDetail(stagesId).subscribe(res => {
      if (res.data) {
        this.getMethodCharges(res.data.method_charge_id);
        this.dataLanesIn = this.getLanes(res.data.station_input_id, 0);
        this.dataLanesOut = this.getLanes(res.data.station_output_id, 1);
        this.booCodeStage = res.data.booCode;
      }
    });
  }

  getValueStation(value) {
    value = value.id;
    this.formInformation.controls?.timestampOutFrom.patchValue('');
    this.formInformation.controls?.timestampOutTo.patchValue('');
    this.formInformation.controls?.choose_year.patchValue(null);
    this.formInformation.controls?.month.patchValue(null);
    this.formInformation.controls?.quarter.patchValue(null);
    if (value) {
      this.formInformation.controls.ticket.patchValue('');
      this.formInformation.controls.calculation.patchValue('');
      this.stations = this.dataOptionStations.filter(station => station.id == value)[0].name;
      this.methodCharges = this.dataOptionStations.filter(station => station.id == value)[0].method_charge_id;
      this.getMethodCharges(this.methodCharges);
      this.getLanes(value, 1);
      this.dataLanesIn = [];
      this.dataLanesOut = [];
    }
  }

  getLanes(value, type?: number) {
    this._customeBuyticket.getLanes(value).subscribe(res => {
      if (type == 1) {
        this.dataLanesOut = res.data.laneList;
        this.booCode = res.data.booCode;
      } else {
        this.dataLanesIn = res.data.laneList;
      }
    });
  }

  addDayMonths(date: Date): Date {
    date.setDate(date.getDate() + 29);
    return date;
  }

  addDayQuarter(date: Date): Date {
    date.setDate(date.getDate() + 89);
    return date;
  }
  getValueTicket(value) {
    value = value.servicePlanTypeId;
    this.setValidateByTicketType(this.formInformation.get('calculation').value, value);
    this.ticket = this.dataOptionTicket.filter(ticket => ticket.servicePlanTypeId == value)[0].name;
    if (value) {
      this.isDisableStart = false;
    } else {
      this.isDisableStart = true;
    }
    if (this.formInformation.controls.calculation.value == BUY_TICKET.TINH_THUONG) {
      this.isHiddenDay = false;
      if (value == TICKET_TYPE.VE_THANG) {
        this.isHiddenQuarter = false;
        this.isHiddenTime = true;
        this.formInformation.controls.choose_year.patchValue('');
        this.formInformation.controls.month.patchValue('');
      } else if (value == TICKET_TYPE.VE_QUY) {
        this.isHiddenQuarter = true;
        this.isHiddenTime = false;
        this.formInformation.controls.choose_year.patchValue('');
        this.formInformation.controls.quarter.patchValue('');
      }
      this.formInformation.controls.timestampOutFrom.patchValue('');
      this.formInformation.controls.timestampOutTo.patchValue('');
    } else if (this.formInformation.controls.calculation.value == BUY_TICKET.TINH_BLOCK) {
      this.isHiddenDay = true;
      this.isHiddenTime = false;
      this.isHiddenQuarter = false;
      this.formInformation.controls.timestampOutFrom.patchValue('');
      this.formInformation.controls.timestampOutTo.patchValue('');
    }
  }

  getValueDate(event) {
    const newDate = new Date(event.value);
    if (this.formInformation.controls.ticket.value == TICKET_TYPE.VE_THANG) {
      this.returnDate = this.addDayMonths(newDate);
    } else if (this.formInformation.controls.ticket.value == TICKET_TYPE.VE_QUY) {
      this.returnDate = this.addDayQuarter(newDate);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue) {
      const x = this.oldData.filter(x => x.plateNumber.toUpperCase().search(filterValue.trim().toUpperCase()) != -1);
      this.listVehicles = x;
    } else {
      this.listVehicles = this.oldData;
    }
  }
  async getListVehicle() {
    const page = {
      pagesize: 100000,
    };
    this._vehiclesRFID.searchVehiclesActive(page, this.selectedContract.contractId).subscribe(res => {
      this.listVehicles = res.data.listData.map(x => {
        x.car_style = this.dataModel.vehicleGroupOpts.find(n => n.id == x.vehicleGroupId)?.name;
        return x;
      });

      this.listVehicles.sort((a, b) => ('' + a.car_style).localeCompare(b.car_style));

      this.totalCount = res.data.count;
      this.oldData = Array.from(this.listVehicles);
    });
  }

  removeItem(row, i) {
    const message = this._translateService.instant('buyTicket.delete-ticketv1') + row.plateNumber + this._translateService.instant('buyTicket.delete-ticketv2') + row.distance_type + this._translateService.instant('buyTicket.delete-ticketv3') + row.ticket;

    const dialogData = new ConfirmDialogModel(
      this._translateService.instant('common.confirm.title.delete'),
      message
    );

    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        row.total_money = 0;
        this.dataBuyTicket.splice(i, 1);
        this.tableBuyticket.renderTable();
        this.formInformation.controls.total_money.setValue(this.dataBuyTicket.reduce((x, y) => x + y.total_money, 0));
      }
    });

  }

  checkCheckBoxvalue(event) {
    this.automaticRenewal = event.checked;
  }

  async getFee() {
    const plateNumberSelected = [];
    let plateNumberIsExistsDb = [];
    let plateNumberCheckCart = [];
    const listTicketNoMoney = [];
    const vehiclesGroupName = [];
    let plateNumberIsExistsCart = [];
    let dataAddTable = [];
    const dataTable = [];
    let plateNumberAddToTable = [];
    const allPlateNumberCheck = [];

    if (this.formInformation.controls.calculation.value == BUY_TICKET.TINH_BLOCK) {
      this.starttranform = this.departDate;
      this.endtranform = this.returnDate;
    }
    if (this.formInformation.controls.calculation.value == BUY_TICKET.TINH_THUONG) {
      if (this.formInformation.controls.ticket.value == TICKET_TYPE.VE_THANG) {
        const monthOfYear = new Date(this.formInformation.controls.choose_year.value, this.formInformation.controls.month.value - 1, 1);
        const endMonth = new Date(monthOfYear);
        const lastDay = new Date(endMonth.getFullYear(), endMonth.getMonth() + 1, 0);
        endMonth.setDate(lastDay.getDate());

        this.starttranform = monthOfYear;
        this.endtranform = endMonth;
      }
      if (this.formInformation.controls.ticket.value == TICKET_TYPE.VE_QUY) {
        const quarterOfYear = new Date();
        const quarterOfYearEnd = new Date();
        quarterOfYear.setFullYear(this.formInformation.controls.choose_year.value);
        if (this.formInformation.controls.quarter.value == QUARTER_YEAR.QUY1) {
          quarterOfYear.setMonth(0);
          quarterOfYear.setDate(1);
          quarterOfYearEnd.setMonth(2);
          quarterOfYearEnd.setDate(31);
          quarterOfYearEnd.setFullYear(this.formInformation.controls.choose_year.value);
          this.starttranform = quarterOfYear;
          this.endtranform = quarterOfYearEnd;
        }
        if (this.formInformation.controls.quarter.value == QUARTER_YEAR.QUY2) {
          quarterOfYear.setMonth(3);
          quarterOfYear.setDate(1);
          quarterOfYearEnd.setMonth(5);
          quarterOfYearEnd.setDate(30);
          quarterOfYearEnd.setFullYear(this.formInformation.controls.choose_year.value);
          this.starttranform = quarterOfYear;
          this.endtranform = quarterOfYearEnd;
        }
        if (this.formInformation.controls.quarter.value == QUARTER_YEAR.QUY3) {
          quarterOfYear.setMonth(6);
          quarterOfYear.setDate(1);
          quarterOfYearEnd.setMonth(8);
          quarterOfYearEnd.setDate(30);
          quarterOfYearEnd.setFullYear(this.formInformation.controls.choose_year.value);
          this.starttranform = quarterOfYear;
          this.endtranform = quarterOfYearEnd;
        }
        if (this.formInformation.controls.quarter.value == QUARTER_YEAR.QUY4) {
          quarterOfYear.setMonth(9);
          quarterOfYear.setDate(1);
          quarterOfYearEnd.setMonth(11);
          quarterOfYearEnd.setDate(31);
          quarterOfYearEnd.setFullYear(this.formInformation.controls.choose_year.value);
          this.starttranform = quarterOfYear;
          this.endtranform = quarterOfYearEnd;
        }
      }
    }

    this.servicePlanDTOList = [];
    const stationIdBoo = this.formInformation.get('stations').value ? Number(this.formInformation.get('stations').value) : null;
    const stageIdBoo = this.formInformation.get('stages').value ? Number(this.formInformation.get('stages').value) : null;
    const stationTypeBoo = this.formInformation.get('station_type').value ? Number(this.formInformation.get('station_type').value) : 0;
    this.selection.selected.forEach(itemV => {
      this.servicePlanDTOList.push({
        vehicleGroupId: itemV.vehicleGroupId,
        plateNumber: itemV.plateNumber,
        stationId: this.formInformation.get('station_type').value == BUY_TICKET.TRAM_MO ? stationIdBoo : null,
        stageId: this.formInformation.get('station_type').value == BUY_TICKET.TRAM_KIN ? stageIdBoo : null,
        effDate: moment(this.starttranform).format(COMMOM_CONFIG.DATE_FORMAT),
        expDate: moment(this.endtranform).format(COMMOM_CONFIG.DATE_TIME_EXPIRE_FORMAT),
        quantity: 1,
        vehicleId: itemV.vehicleId,
        booCode: this.formInformation.get('station_type').value == BUY_TICKET.TRAM_KIN ? this.booCodeStage : this.booCode,
        servicePlanTypeId: Number(this.formInformation.get('ticket').value),
        autoRenew: this.automaticRenewal ? 1 : 0,
        chargeMethodId: Number(this.formInformation.controls.calculation.value),
        status: BUY_TICKET.STATUS,
        stationType: stationTypeBoo,
        vehicleTypeId: itemV.vehicleTypeId,
        netWeight: itemV.netWeight,
        cargoWeight: itemV.cargoWeight,
        seatNumber: itemV.seatNumber,
        epc: itemV.epc
      });
    });

    this.listServicePlanFee = (await this._vehiclesRFID.getFee(this.servicePlanDTOList).toPromise());
    if (!this.listServicePlanFee.data) {
      this.toastr.warning(this.listServicePlanFee.mess.description);
      return
    }
    this.listFeeByVehicleGroupId = this.listServicePlanFee?.data.listServicePlan;
    this.selection.selected.forEach(item => {
      plateNumberSelected.push(item.plateNumber);
      let moneyMap;
      // neu la tram rach lieu thi khong check vehicleGroupId
      if (stationIdBoo != 5018) {
        moneyMap = this.listFeeByVehicleGroupId.find(f => f.vehicleGroupId == item.vehicleGroupId)?.fee;
      } else {
        moneyMap = this.listFeeByVehicleGroupId.find(f => f.plateNumber == item.plateNumber)?.fee;
      }
      item.moneyMap = moneyMap;
      item.booCode = this.formInformation.get('station_type').value == BUY_TICKET.TRAM_KIN ? this.booCodeStage : this.booCode;
      item.stationType = this.formInformation.get('station_type').value ? Number(this.formInformation.get('station_type').value) : 0;


      dataTable.push(item);
      if (!moneyMap) {
        vehiclesGroupName.push(this.dataModel.vehicleGroupOpts.find(n => n.id == item.vehicleGroupId)?.name);
        listTicketNoMoney.push(item.plateNumber);
      } else {
        if (this.listServicePlanFee.data.servicePlanVehicleDuplicate) {
          plateNumberIsExistsDb = this.listServicePlanFee.data.servicePlanVehicleDuplicate.split(',');
        }
      }
    });

    const plateNumberCheck = [...plateNumberIsExistsDb, ...listTicketNoMoney];
    plateNumberCheckCart = plateNumberSelected.filter(x => plateNumberCheck.indexOf(x) == -1);

    if (vehiclesGroupName.length > 0) {
      this.notificationVehiclesNoMoney([...new Set(vehiclesGroupName)]);
    }

    const stagesId = this.formInformation.get('station_type').value == BUY_TICKET.TRAM_KIN ? this.formInformation.get('stages').value : null;
    const stationId = this.formInformation.get('station_type').value == BUY_TICKET.TRAM_MO ? this.formInformation.get('stations').value : null;
    const laneOut = this.formInformation.get('lane_out').value ? this.formInformation.get('lane_out').value : ''


    this.dataBuyTicket.forEach(itemCart => {
      if (stagesId == itemCart.stagesId && stationId == itemCart.stationId && laneOut == itemCart.laneOut && ((itemCart.start_date <= this.starttranform && this.starttranform <= itemCart.end_date) || (this.starttranform <= itemCart.start_date && itemCart.start_date <= this.endtranform))) {
        allPlateNumberCheck.push(itemCart.plateNumber);
      }
    });

    if (plateNumberCheckCart.length > 0) {
      plateNumberAddToTable = plateNumberCheckCart.filter(x => allPlateNumberCheck.indexOf(x) == -1);
      plateNumberIsExistsCart = plateNumberCheckCart.filter(x => plateNumberAddToTable.indexOf(x) == -1);
    }

    if (plateNumberIsExistsDb.length > 0) {
      this.notificationExistsDb(plateNumberIsExistsDb);
    }

    if (plateNumberIsExistsCart.length > 0) {
      this.notificationExistCart(plateNumberIsExistsCart);
    }

    dataAddTable = dataTable.filter(x => plateNumberAddToTable.includes(x.plateNumber));

    this.pushTableNoDialog(dataAddTable);
  }

  notificationVehiclesNoMoney(vehiclesGroup) {
    const arrPlateNumberNo = vehiclesGroup.join(', ');
    this.toastr.warning(this._translateService.instant('common.duplicate_ticketv1')
      + `${arrPlateNumberNo}` + this._translateService.instant('common.invalid_fee'), null, {
      closeButton: true,
      disableTimeOut: true
    }
    );
  }

  notificationExistCart(plateNumberIsExistsCart) {
    const arrPlateNumberNo = plateNumberIsExistsCart.join(', ');
    this.toastr.warning(this._translateService.instant('common.duplicate_ticketv1')
      + `${arrPlateNumberNo}` + this._translateService.instant('common.duplicate_ticketv3'), null, {
      closeButton: true,
      disableTimeOut: true
    }
    );
  }

  notificationExistsDb(arrPlateNumber) {
    const arrPlateNumberNo = arrPlateNumber.join(', ');
    this.toastr.warning(this._translateService.instant('common.duplicate_ticketv1')
      + `${arrPlateNumberNo}` + this._translateService.instant('common.duplicate_ticketv2'), null, {
      closeButton: true,
      disableTimeOut: true
    }
    );
  }

  pushTableNoDialog(item) {
    let calculator;

    if (this.formInformation.controls.station_type.value == BUY_TICKET.TRAM_KIN) {
      this.distanceType = this.dataOptionStages.find(station => station.id == this.formInformation.controls.stages.value)?.name;
    } else if (this.formInformation.controls.station_type.value == BUY_TICKET.TRAM_MO) {
      this.stations = this.dataOptionStations.find(station => station.id == this.formInformation.controls.stations.value)?.name;
    }

    if (this.dataMethodCharges && this.dataMethodCharges.length > 0) {
      calculator = this.dataMethodCharges[0].val;
    } else {
      calculator = '';
    }

    item.forEach(im => {
      this.dataBuyTicket.push({
        vehiclesGroupId: im.vehicleGroupId,
        number: im.plateNumber,
        distance_type: this.formInformation.controls.station_type.value == BUY_TICKET.TRAM_KIN ? this.distanceType : this.stations,
        ticket: this.ticket,
        calculation: calculator,
        status: this.statusActive[im.status],
        automaticRenewal: this.automaticRenewal ? 'Có' : 'Không',
        date_register: moment(new Date()).format(COMMOM_CONFIG.DATE_FORMAT),
        start_date: this.starttranform,
        end_date: this.endtranform,
        total_money: im.moneyMap,
        plateNumber: im.plateNumber,
        vehicleGroupId: im.vehicleGroupId,
        vehicleId: im.vehicleId,
        vehicleTypeId: im.vehicleTypeId,
        stationId: (this.formInformation.controls.station_type.value == BUY_TICKET.TRAM_MO) ? this.formInformation.controls.stations.value : null,
        stagesId: (this.formInformation.controls.station_type.value == BUY_TICKET.TRAM_KIN) ? this.formInformation.controls.stages.value : null,
        laneOut: this.formInformation.controls.lane_out.value,
        booCode: im.booCode,
        stationType: im.stationType,
        netWeight: im.netWeight,
        cargoWeight: im.cargoWeight,
        seatNumber: im.seatNumber,
        epc: im.epc
      });
      this.tableBuyticket.renderTable();
    });
  }

  getBalance() {
    this._vehiclesRFID.getBalance(this.selectedContract.custId, this.selectedContract.contractId).subscribe(res => {
      this.balance = res.data.balance;
    });
  }

  getHeight() {
    if (this.dataBuyTicket) {
      if (this.dataBuyTicket.length > 5) {
        return '300px';
      } else {
        return 'fit-content';
      }
    }
  }
  weekdaysOnly = (d: Date) => d.getDay() !== 0 && d.getDay() !== 6;

}
