import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core/app-config';
import { SelectOptionModel } from '@app/core/models/common.model';
import { AppStorage } from '@app/core/services/AppStorage';
import { ContractService } from '@app/core/services/contract/contract.service';
import { CustomerService } from '@app/core/services/customer/customer.service';
import { VehicleService } from '@app/core/services/vehicle/vehicle.service';
import { AttachFileComponent } from '@app/shared/components/attach-file/attach-file.component';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { ViewFileImageComponent } from '@app/shared/components/view-file-image/view-file-image.component';
import { ViewFilePdfComponent } from '@app/shared/components/view-file-pdf/view-file-pdf.component';
import { ACTION_TYPE, HTTP_CODE, STATUS_CONTRACT, STATUS_RFID_VEHICLE } from '@app/shared/constant/common.constant';
import { CommonCRMService } from '@app/shared/services/common-crm.service';
import { MtxDialog, MtxGridColumn } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, tap } from 'rxjs/operators';
import { PeriodicElement } from '../buy-ticket/buy-ticket.component';

@Component({
  selector: 'app-transfer-own-vehicle',
  templateUrl: './transfer-own-vehicle.component.html',
  styleUrls: ['./transfer-own-vehicle.component.scss']
})
export class TransferOwnVehicleComponent extends BaseComponent implements OnInit {

  displayedColumnsFee = ['fee', 'price'];
  columnsFee: MtxGridColumn[];
  dataFeesType = [];
  @ViewChild('tableFee') tableFee: MatTable<any>;
  dataReasonType: any;
  formSearch: FormGroup;
  listOptionLicense: SelectOptionModel[] = [] as SelectOptionModel[];
  valueContract: string;
  valueCustomer: string;
  isDisbaleButton = false;

  selectContract: any = {};
  state = [];
  filteredStatesContract = this.state;
  filteredStatesCustomer = this.state;
  columnsVehicle: MtxGridColumn[] = [];
  listSelectedContract = [];
  selectionContract = new SelectionModel<any>(true, []);
  displayedColumnsVehicle = [];
  selectedCustomer: any = {};

  listVehicleSource = [];
  columnsContractEnd: MtxGridColumn[];
  displayedColumnsContractEnd = [];
  @ViewChild('tableVehicleMerge') tableVehicleMerge: MatTable<any>;
  selectionVehicleMerge = new SelectionModel<any>(true, []);
  listSelectedVehicleMerge = [];
  startCustomer = 0;
  sizeCustomer = 0;

  visibleTable = false;
  contractId: number;
  priceFee: number;
  amountFee: number;
  checkRadio: number;
  checkCheckBox = 0;
  actObject: number;
  statusVehicle = STATUS_RFID_VEHICLE;
  selectLicence: number;
  tranferContractId: number;
  documentTypeId: number;
  @Input() customerId: number;
  totalRecordVehicle = 0;
  totalRecordContract = 0;

  formInformation: FormGroup;
  isLoadingAutoContract: boolean;
  isLoadingAutoCustomer: boolean;

  listDataProfile = [];
  displayedColumnsProfile = ['stt', 'documentType', 'documentName', 'actionDelete'];
  dataSourceProfile = new MatTableDataSource<any>(this.listDataProfile);
  columnsProfile: MtxGridColumn[];
  @ViewChild('tableProfile') tableProfile: MatTable<any>;
  @ViewChild(MatPaginator, { static: true }) paginatorProfile: MatPaginator;
  indexPaginator = 0;
  pageSizeList = [10, 20, 50, 100];
  constructor(
    public actr: ActivatedRoute,
    public dialog: MtxDialog,
    private _toastrService: ToastrService,
    protected _translateService: TranslateService,
    private _commonCRMService: CommonCRMService,
    private _contractService: ContractService,
    private _vehicleService: VehicleService,
    private _contractInfoService: ContractService,
    private _customerInfoService: CustomerService,
    private fb: FormBuilder,
  ) {
    super(actr, null, RESOURCE.RFID, _toastrService, _translateService);
  }

  ngOnInit() {
    this.getListDocumentTypeObject();
    this.isLoading = false;

    this.formInformation = this.fb.group({
      searchCustomer: ['', Validators.required],
      searchContract: ['', Validators.required],
    });

    this.formSearch = this.fb.group({
      license: [''],
      lydo: ['', Validators.required],
    });

    this._translateService.get('customer-management.formCaculateChangeFee').subscribe(res => {
      this.columnsFee = [
        { i18n: res.feeType, field: 'fee', disabled: true },
        { i18n: res.price, field: 'price', disabled: true },
      ];
    });

    this.getReason();
    this.getFees(ACTION_TYPE.CHUYEN_CHU_QUYEN_PT);
    this.dataModel.vehicleGroupOpt = AppStorage.get('vehicle-group');
    this.dataModel.vehicleTypeOpt = AppStorage.get('vehicle-type');

    this.columnsVehicle = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'briefcase.license_plates', field: 'plateNumber' },
      { i18n: 'change_card.serial_number', field: 'rfidSerial' },
      { i18n: 'contractAppendix.type-vehicle', field: 'nameGroup' },
      { i18n: 'contractAppendix.boss-vehicle', field: 'owner' },
      { i18n: 'change_card.card_status', field: 'activeStatus' },
      { i18n: 'change_card.card_status', field: 'select' }
    ];
    super.mapColumn();
    this.displayedColumnsVehicle = this.columnsVehicle.map(x => x.field);

    this.formInformation.get('searchCustomer').valueChanges.pipe(debounceTime(1000), tap(() => {
      this.isLoadingAutoCustomer = true;
      this.filteredStatesContract = [];
    })).subscribe(value => {
      if (typeof value !== 'object') {
        this._contractInfoService.searchContractInfo(value.trim()).subscribe(rs => {
          this.isLoadingAutoCustomer = false;
          this.filteredStatesContract = rs.data.listData;
        });
      }
    });

    this.columnsContractEnd = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'contractDetach.contract-number', field: 'contractNo' },
      { i18n: 'contractDetach.sign-date', field: 'signDate' },
      { i18n: 'contractDetach.sign-employee', field: 'signName' },
      { i18n: 'button', field: 'button' },
    ];
    super.mapColumn();
    this.displayedColumnsContractEnd = this.columnsContractEnd.map(x => x.field);

    this.formInformation.get('searchContract').valueChanges.pipe(debounceTime(1000), tap(() => {
      this.isLoadingAutoContract = true;
      this.filteredStatesCustomer = [];
    })).subscribe(value => {
      if (typeof value !== 'object') {
        this._customerInfoService.searchCustomerInfo(value.trim()).subscribe(rs => {
          this.isLoadingAutoContract = false;
          this.filteredStatesCustomer = rs.data.listData;
        });
      }
    });

    this.selectionVehicleMerge.changed.asObservable().subscribe(select => {
      this.checkCheckBox = this.selectionVehicleMerge.selected.length;
      if (select.added.length > 0) {
        this.isDisbaleButton = false;
        this.listSelectedVehicleMerge.push(select.added[0]);
      } else {
        select.removed.forEach(element => {
          const findIndex = this.listSelectedVehicleMerge.findIndex(vehicle => vehicle.licensePlates == element.licensePlates);
          this.listSelectedVehicleMerge.splice(findIndex, 1);
        });
      }
    });
  }

  inItColumns() {
    this._translateService.get('customer-management.updateProfileTable').subscribe(res => {
      this.columnsProfile = [
        { i18n: res.stt, field: 'stt', disabled: true },
        { i18n: res.documentType, field: 'documentType', disabled: true },
        { i18n: res.documentName, field: 'documentName', disabled: true },
        { i18n: res.actionDelete, field: 'actionDelete', disabled: true }
      ];
    });
  }

  renderTable() {
    this.dataSourceProfile.paginator = this.paginatorProfile;
    this.tableProfile.renderRows();
  }

  onPaginateChange(event) {
    this.indexPaginator = event.pageIndex * event.pageSize;
  }

  deleteProfile(i) {
    this.listDataProfile.splice(i + this.indexPaginator, 1);
    this.renderTable();
  }
  onSelectedCustomer(event) {
    this.selectedCustomer = event.option.value;
    this.getDataCustomer(0, this.pageSizeList[0]);
  }

  async filterCustomer(value: any) {
    if (typeof value === 'object') {
      return;
    }
    this.filteredStatesCustomer = [];
    const data = (await this._customerInfoService.searchCustomerInfo(value.trim()).toPromise()).data;
    if (data.listData.length > 0) {
      this.filteredStatesCustomer = data.listData;
    }
    return this.filteredStatesCustomer;
  }

  getDataCustomer(offset, limit) {
    const body = {
      custId: this.selectedCustomer.custId,
      startrecord: offset,
      pagesize: limit
    };
    this._contractService.searchAllContracts(body).subscribe(res => {
      this.listVehicleSource = res.data.listData.filter(data => data.status == STATUS_CONTRACT.HOATDONG);
      this.tranferContractId = this.listVehicleSource[0].contractId;
      this.totalRecordContract = this.listVehicleSource ? this.listVehicleSource.length : 0;
    });
  }

  clickRatio(record) {
    this.contractId = record.contractId;
    this.visibleTable = true;
  }

  onCustomerPageChange(event) {
    this.startCustomer = event.pageIndex == 0 ? event.pageIndex : ((event.pageIndex * event.pageSize));
    this.sizeCustomer = event.pageSize;
    this.getDataCustomer(this.startCustomer, this.sizeCustomer);
  }

  getOptionTextCustomer(option) {
    if (option) {
      return option.custName + ' - ' + option.documentNumber;
    }
  }

  onSelectedContract(event) {
    this.selectContract = event.option.value;
    this.getData();
  }

  getData() {
    this._vehicleService.searchVehiclesAssignRFID(this.searchModel, this.selectContract.contractId).subscribe(res => {
      this.dataModel.dataSource = res.data.listData.filter(data => (data.activeStatus == STATUS_RFID_VEHICLE.HOATDONG || data.activeStatus == STATUS_RFID_VEHICLE.HUY || data.activeStatus == STATUS_RFID_VEHICLE.DONG || data.activeStatus == STATUS_RFID_VEHICLE.MO));
      this.dataModel.dataSource.map(x => {
        x.nameGroup = this.dataModel.vehicleGroupOpt.find(f => f.id == x.vehicleGroupId)?.name;
        return x;
      });
      this.totalRecordVehicle = this.dataModel.dataSource ? this.dataModel.dataSource.length : 0;
    });
  }

  async filterContract(value: any) {
    if (typeof value === 'object') {
      return;
    }
    this.filteredStatesContract = [];
    const data = (await this._contractInfoService.searchContractInfo(value.trim()).toPromise()).data;
    if (data.listData.length > 0) {
      this.filteredStatesContract = data.listData;
    }
    return this.filteredStatesContract;
  }

  getOptionTextContract(option) {
    if (option) {
      return option.contractNo;
    }
  }

  isAllSelectedVehicle() {
    const numSelected = this.selectionVehicleMerge.selected.length;
    const numRows = this.dataModel.dataSource ? this.dataModel.dataSource.length : 0;
    return numSelected === numRows;
  }

  masterToggleVehicle() {
    this.isAllSelectedVehicle()
      ? this.selectionVehicleMerge.clear()
      : this.dataModel.dataSource.forEach(row => this.selectionVehicleMerge.select(row));
  }

  checkboxLabelVehicle(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelectedVehicle() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionVehicleMerge.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  getListDocumentTypeObject() {
    this._commonCRMService.getListDocumentTypeObject(ACTION_TYPE.CHUYEN_CHU_QUYEN_PT).subscribe(res => {
      this.listOptionLicense = res.data.map(val => {
        return {
          id: val.id,
          code: val.code,
          value: val.val
        };
      });
    });
  }

  chooseFileChange(event) {
    this.formSearch.controls.lydo.clearValidators();
    this.formSearch.controls.lydo.updateValueAndValidity();
    this.chooseFileModal(event, AttachFileComponent);
  }

  chooseFileModal(record?, componentTemplate?) {
    const dialog = this.dialog.open({
      width: '600px',
      data: { record },
    }, componentTemplate);

    dialog.afterClosed().subscribe(res => {
      this.formSearch.controls.lydo.clearValidators();
      this.formSearch.controls.lydo.updateValueAndValidity();
      // lọc ra tên file theo id trong danh sách file
      const licenseName = this.formSearch.value.license ? this.listOptionLicense.filter(license => license.code == this.formSearch.value.license)[0].value : '';
      let stt = 1;
      res.forEach(file => {
        const license = {
          stt: stt++,
          documentType: licenseName,
          documentTypeId: this.formSearch.value.license,
          documentName: file.fileName,
          fileName: file.fileName,
          fileSize: file.fileSize,
          fileBase64: file.fileBase64,
          fullBase64: file.fullBase64
        };
        this.listDataProfile.push(license);
      });
      this.renderTable();
    });
  }

  confirmDialog(value?: any): void {

    const dialogData = new ConfirmDialogModel(this._translateService.instant('customer.notification'), this._translateService.instant('customer.action'));

    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.transferVehicle();
      }
    });
  }

  getReason() {
    const actTypeId = ACTION_TYPE.CHUYEN_CHU_QUYEN_PT;
    this._commonCRMService.getReason(actTypeId).subscribe(res => {
      this.dataReasonType = res.data;
    });
  }

  getFees(actTypeId) {
    this._commonCRMService.getFees(actTypeId).subscribe(res => {
      this.priceFee = res.data.fee;
      this.amountFee = res.data.fee;
      const fee_type = {
        fee: this._translateService.instant('contract.fee_change_title'), price: res.data.fee
      };
      this.dataFeesType.push(fee_type);
      const fee_total = {
        fee: this._translateService.instant('contract.total_fee'), price: res.data.fee
      };
      this.dataFeesType.push(fee_total);
      this.tableFee.renderRows();
    });
  }

  actionTransferVehicle() {
    this.confirmDialog();
  }

  transferVehicle() {
    if (!this.selectedCustomer.custId && !this.selectedCustomer.custName && !this.selectedCustomer.documentNumber && !this.selectedCustomer.dateOfIssue && !this.selectedCustomer.phoneNumber) {
      this._toastrService.warning(this._translateService.instant('common.invalid.search-customer'));
      return;
    } else if (!this.contractId) {
      this._toastrService.warning(this._translateService.instant('common.invalid.select-contract'));
      return;
    }
    else if (!this.selectContract.custId && !this.selectContract.custName && !this.selectContract.contractNo && !this.selectContract.signDate) {
      this._toastrService.warning(this._translateService.instant('common.invalid.search-contract'));
      return;
    }
    else if (!this.checkCheckBox) {
      this._toastrService.warning(this._translateService.instant('common.invalid.select-vehicle'));
      return;
    }
    else if (this.selectedCustomer.custId == this.selectContract.custId) {
      this._toastrService.warning(this._translateService.instant('common.invalid.tranferor-same-assignee'));
      return;
    } else if (!this.formSearch.controls.lydo.value) {
      this._toastrService.warning(this._translateService.instant('common.invalid.reason'));
      return;
    }
    const listVehicleIdMerge = [];
    this.listSelectedVehicleMerge.forEach(elementVehicle => {
      listVehicleIdMerge.push(elementVehicle.vehicleId);
    });

    const body = {
      actTypeId: ACTION_TYPE.CHUYEN_CHU_QUYEN_PT,
      amount: this.amountFee,
      price: this.priceFee,
      reasonId: Number(this.formSearch.controls.lydo.value),
      transferContractId: this.tranferContractId,
      transferVehicleIds: listVehicleIdMerge,
      contractProfileDTOList: this.listDataProfile.map(x => {
        return {
          custId: this.selectedCustomer.custId,
          contractId: this.tranferContractId,
          documentTypeId: this.listOptionLicense.find(x => x.code == this.formSearch.controls.license.value).id,
          fileName: x.fileName,
          fileBase64: x.fileBase64
        };
      })
    };
    this._vehicleService.transferVehicle(body).subscribe(res => {
      this.isDisbaleButton = true;
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this._toastrService.success(this._translateService.instant('buyTicket.merge_success'));
        this.valueContract = null;
        this.valueCustomer = null;
        this.formSearch.reset();
        this.selectContract = {};
        this.selectedCustomer = {};
        this.totalRecordVehicle = 0;
        this.totalRecordContract = 0;
        this.dataModel.dataSource = [];
        this.listVehicleSource = [];
        this.listDataProfile = [];
        this.dataFeesType = [];
        this.formSearch.controls.lydo.clearValidators();
        this.formSearch.controls.lydo.updateValueAndValidity();
        this.listSelectedVehicleMerge = [];
      } else {
        this._toastrService.warning(res.mess.description);
      }
    }, err => {
      this.toastr.error(this._translateService.instant('common.500Error'));
    });
  }

  viewProfile(row) {
    const checkExtension = row.documentName.split('.')[1];
    if (checkExtension != 'pdf') {
      this.openViewImageProfile(row);
    } else {
      this.openViewPdfProfile(row);
    }
  }

  openViewImageProfile(row): void {
    const dialogRef = this.dialog.originalOpen(ViewFileImageComponent, {
      data: row
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
      }
    });
  }

  openViewPdfProfile(row): void {
    const dialogRef = this.dialog.originalOpen(ViewFilePdfComponent, {
      data: row
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
      }
    });
  }
}
