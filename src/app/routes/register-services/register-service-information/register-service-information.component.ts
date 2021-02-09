import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core/app-config';
import { CreateVehicleSuccessModel, SelectOptionModel } from '@app/core/models/common.model';
import { ContractRegisterModel, CustomerInforModel, VehicleRegisterModel } from '@app/core/models/customer-register.model';
import { ContractService } from '@app/core/services/contract/contract.service';
import { CustomerService } from '@app/core/services/customer/customer.service';
import { VehicleService } from '@app/core/services/vehicle/vehicle.service';
import { RouteStore } from '@app/routes/routes.store';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ACTION_TYPE, CUSTOMER_TYPE, gender, HTTP_CODE, STATUS_RFID_VEHICLE, STATUS_VEHICLE } from '@app/shared/constant/common.constant';
import { SharedDirectoryService } from '@app/shared/services/shared-directory.service';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { RegisterServicesStore } from '../register-services.store';
import { AssignRfidDialogComponent } from './assign-rfid-dialog/assign-rfid-dialog.component';

@Component({
  selector: 'app-register-service-information',
  templateUrl: './register-service-information.component.html',
  styleUrls: ['./register-service-information.component.scss']
})
export class RegisterServiceInformationComponent extends BaseComponent implements OnInit, AfterViewInit {

  @Input() fullNameCust: string;
  @Output() backToRegisterForm = new EventEmitter<boolean>();
  customerInformationForm: FormGroup;
  contractInformationForm: FormGroup;
  vehiclesNotRFIDForm: FormGroup;
  vehiclesHaveRFIDForm: FormGroup;
  dataFormCustomerInfor: CustomerInforModel;
  dataFormContractInfor: ContractRegisterModel;
  dataFormVehicleInfor: VehicleRegisterModel;
  customerType = CUSTOMER_TYPE;
  listOptionGroupVehicles: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionVehicleType: SelectOptionModel[] = [] as SelectOptionModel[];
  customerTypeId: number = CUSTOMER_TYPE.CA_NHAN;
  detailCustomer: any;
  detailContract: any;
  detailAddress: any;
  listOptionGender = gender;
  pageSizeList = [10, 20, 50, 100];

  listDataHaveRFID = [];
  countTableHaveRFID: number = 0;
  listSelectedHaveRFID = [];
  indexPaginatorHaveRFID: number = 0;
  selectionHaveRFID = new SelectionModel<any>(true, []);
  @ViewChild('tableHaveRFID') tableHaveRFID: MatTable<any>;
  @ViewChild('paginatorHaveRFID', { static: true }) paginatorHaveRFID: MatPaginator;
  displayedColumns_haveRFID: string[] = ['stt', 'select', 'licensePlates', 'serialNumber', 'vehiclesTypeFee', 'cardStatus'];

  listDataNotRFID = [];
  countTableNotRFID: number = 0;
  statusVehicle = STATUS_VEHICLE;
  activeStatus = STATUS_RFID_VEHICLE;
  listSelectedNotRFID = [];
  indexPaginatorNotRFID: number = 0;
  selectionNotRFID = new SelectionModel<any>(true, []);
  @ViewChild('tableNotRFID') tableNotRFID: MatTable<any>;
  @ViewChild('paginatorNotRFID', { static: true }) paginatorNotRFID: MatPaginator;
  displayedColumns_notRFID: string[] = ['stt', 'select', 'plateNumber', 'owner', 'vehiclesType', 'cargoWeight', 'seatNumber', 'status']

  constructor(
    private _sharedDirectoryService: SharedDirectoryService,
    private _contractService: ContractService,
    private _customerService: CustomerService,
    private _vehicleRegisterService: VehicleService,
    private routeStore: RouteStore,
    private registerServicesStore: RegisterServicesStore,
    public actr: ActivatedRoute,
    private fb: FormBuilder,
    protected translateService: TranslateService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog) {
    super(actr, _vehicleRegisterService, RESOURCE.CUSTOMER);
  }

  ngOnInit() {
    this.buildForm();
    this.subscribleSelection();
    this.getListVehicleType();
  }

  ngAfterViewInit() {
    this.paginatorNotRFID.pageIndex = 0;
    this.paginatorHaveRFID.pageIndex = 0;
  }

  onPaginateChangeNotRFID(event) {
    this.indexPaginatorNotRFID = event.pageIndex * event.pageSize;
    const data = {
      startrecord: event.pageIndex == 0 ? event.pageIndex : ((event.pageIndex * event.pageSize)),
      pagesize: event.pageSize,
      vehicleImportType: 3
    }
    this.getDataTableFromImportFile(data, this.detailContract.contractId)
  }

  onPaginateChangeHaveRFID(event) {
    this.indexPaginatorHaveRFID = event.pageIndex * event.pageSize;
    const data = {
      startrecord: event.pageIndex == 0 ? event.pageIndex : ((event.pageIndex * event.pageSize)),
      pagesize: event.pageSize
    }
    this.getDatatableHaveRFID(this.detailContract.contractId, data);
  }

  subscribleSelection() {
    this.selectionNotRFID.changed.asObservable().subscribe(select => {
      if (select.added.length > 0) {
        this.listSelectedNotRFID.push(select.added[0]);
      } else {
        select.removed.forEach(element => {
          const findIndex = this.listSelectedNotRFID.findIndex(vehicle => vehicle.licensePlates == element['licensePlates']);
          this.listSelectedNotRFID.splice(findIndex, 1);
        })
      }
    });

    this.selectionHaveRFID.changed.asObservable().subscribe(select => {
      if (select.added.length > 0) {
        this.listSelectedHaveRFID.push(select.added[0]);
      } else {
        select.removed.forEach(element => {
          const findIndex = this.listSelectedHaveRFID.findIndex(vehicle => vehicle.licensePlates == element['licensePlates']);
          this.listSelectedHaveRFID.splice(findIndex, 1);
        })
      }
    });
  }

  isAllSelected() {
    const numSelected = this.selectionHaveRFID.selected.length;
    const numRows = this.listDataHaveRFID ? this.listDataHaveRFID.filter(x => x.activeStatus == this.activeStatus.CHUAKICHHOAT)?.length : 0;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selectionHaveRFID.clear()
      : this.listDataHaveRFID.forEach(row => this.selectionHaveRFID.select(row));
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionHaveRFID.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  isAllSelectedNotRFID() {
    const numSelected = this.selectionNotRFID.selected.length;
    const numRows = this.listDataNotRFID.length;
    return numSelected === numRows;
  }

  masterToggleNotRFID() {
    this.isAllSelectedNotRFID()
      ? this.selectionNotRFID.clear()
      : this.listDataNotRFID.forEach(row => this.selectionNotRFID.select(row));
  }

  checkboxLabelNotRFID(row?: any): string {
    if (!row) {
      return `${this.isAllSelectedNotRFID() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionNotRFID.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  subscribleCustomerRegisterStore() {
    this.registerServicesStore.currentVehicleInfor$.subscribe((res: VehicleRegisterModel) => {
      this.dataFormVehicleInfor = res;
    })
    this.registerServicesStore.currentCreateVehicleSuccess$.subscribe((res: CreateVehicleSuccessModel) => {
      if (res?.customerId) {
        this.getDetailCustomer(res.customerId);
        this.getDetailContract(res.contractId);
        const dataHaveRFID = {
          startrecord: 0,
          pagesize: 10
        }
        this.getDatatableHaveRFID(res.contractId, dataHaveRFID);
        const dataNotRFID = {
          startrecord: 0,
          pagesize: 10,
          vehicleImportType: 3
        }
        this.getDataTableFromImportFile(dataNotRFID, res.contractId);
      }
    });
    this.routeStore.eventImportVehicle$.subscribe((res: CreateVehicleSuccessModel) => {
      if (res?.customerId) {
        this.getDetailCustomer(res.customerId);
        this.getDetailContract(res.contractId);
        const dataNotRFID = {
          startrecord: 0,
          pagesize: 10,
          vehicleImportType: 3
        }
        this.getDataTableFromImportFile(dataNotRFID, res.contractId);
        const dataHaveRFID = {
          startrecord: 0,
          pagesize: 10
        }
        this.getDatatableHaveRFID(res.contractId, dataHaveRFID);
      }
    });
    this.registerServicesStore.currentListOptionVehicleType$.subscribe((res: SelectOptionModel[]) => {
      if (res) {
        this.listOptionVehicleType = res;
      }
    });
    this.routeStore.sendToCustomerInfor$.subscribe((res: CreateVehicleSuccessModel) => {
      if (res) {
        this.getDetailCustomer(res.customerId);
        this.getDetailContract(res.contractId);
        const dataNotRFID = {
          startrecord: 0,
          pagesize: 10,
          vehicleImportType: 3
        }
        this.getDataTableFromImportFile(dataNotRFID, res.contractId);
        const dataHaveRFID = {
          startrecord: 0,
          pagesize: 10
        }
        this.getDatatableHaveRFID(res.contractId, dataHaveRFID);
      }
    });
  }

  buildForm() {
    this.customerInformationForm = this.fb.group({
      customerType: [''],
      customerCode: [''],
      numberPhone: [''],
      fullName: [''],
      dateOfBirth: [''],
      gender: [''],
      cardId: [''],
      dateRange: [''],
      placeOfIssue: [''],
      city: [''],
      district: [''],
      ward: [''],
      street: [''],
      address: [''],
      email: [''],
      companyName: [''],
      taxNo: [''],
      foundingDate: ['']
    });

    this.contractInformationForm = this.fb.group({
      contractNumber: [''],
      signDay: [''],
      signer: [''],
      staff: [''],
      effectiveDate: [''],
      expiryDate: ['']
    });

    this.vehiclesNotRFIDForm = this.fb.group({
      dateRegistrationStart: [null],
      dateRegistrationEnd: [null]
    });

    this.vehiclesHaveRFIDForm = this.fb.group({
      dateRegistrationStart: [null],
      dateRegistrationEnd: [null]
    });
  }

  getListVehicleFee() {
    this._sharedDirectoryService.getListVehicleFee().subscribe(res => {
      this.listOptionGroupVehicles = res.data.listData.map(val => {
        return {
          code: val.id,
          value: val.name
        }
      })
      this.subscribleCustomerRegisterStore();
    });
  }

  getListVehicleType() {
    this._sharedDirectoryService.getListVehicleType().subscribe(res => {
      this.listOptionVehicleType = res.data.listData.map(val => {
        return {
          id: val.id,
          code: val.code,
          value: val.name
        }
      });
      this.getListVehicleFee();
    })
  }

  getDetailCustomer(customerId) {
    this._customerService.getDetailCustomer(customerId).subscribe(res => {
      this.detailCustomer = res.data.listData[0];
      this.customerTypeId = this.detailCustomer.custTypeId;
      this.getAddressDetail(res.data.listData[0].areaCode)
      this.patchValueCustomer(this.detailCustomer);
    });
  }

  getDetailContract(contractId) {
    this._contractService.searchDetailsContract(null, contractId).subscribe(res => {
      this.detailContract = res.data.listData[0];
      this.patchValueContract(this.detailContract);
    })
  }

  getAddressDetail(areaCode) {
    this._sharedDirectoryService.getAddressByCode(areaCode).subscribe(res => {
      if (res.data.length > 0) {
        this.detailAddress = res.data[0];
        this.getListProvince();
        this.getListDistrict(res.data[0].province)
        this.getListWard(res.data[0].district);
      }
    });
  }

  getListProvince() {
    this._sharedDirectoryService.getListAreas().subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        const findProvince = res.data.find(x => x.precinct == this.detailAddress.province);
        if (findProvince) {
          this.customerInformationForm.patchValue({
            city: findProvince.name
          })
        }
      }
    })
  }

  getListDistrict(parentCode) {
    this._sharedDirectoryService.getListAreas(parentCode).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        const findDistrict = res.data.find(x => x.precinct == this.detailAddress.district);
        if (findDistrict) {
          this.customerInformationForm.patchValue({
            district: findDistrict.name
          })
        }
      }
    })
  }

  getListWard(parentCode) {
    this._sharedDirectoryService.getListAreas(parentCode).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        const findWard = res.data.find(x => x.precinct == this.detailAddress.precinct);
        if (findWard) {
          this.customerInformationForm.patchValue({
            ward: findWard.name
          })
        }
      }

    })
  }

  patchValueCustomer(formValue) {
    const genderSelected = this.listOptionGender.find(x => x.code == formValue.gender);
    const genderName = genderSelected ? genderSelected.value : '';
    this.customerInformationForm.patchValue({
      customerType: formValue.custTypeName,
      customerCode: formValue.custId,
      numberPhone: formValue.phoneNumber,
      fullName: formValue.custName,
      dateOfBirth: formValue.birthDate,
      gender: genderName,
      cardId: formValue.documentTypeName,
      dateRange: formValue.dateOfIssue,
      placeOfIssue: formValue.placeOfIssue,
      street: formValue.street,
      address: formValue.areaName,
      email: formValue.email,
      companyName: formValue.custName,
      taxNo: formValue.taxCode,
      foundingDate: formValue.birthDate
    });
  }

  patchValueContract(formValue) {
    this.contractInformationForm.patchValue({
      contractNumber: formValue.contractNo,
      signDay: formValue.signDate,
      signer: formValue.signName,
      staff: formValue.createUser,
      effectiveDate: formValue.effDate,
      expiryDate: formValue.expDate
    });
  }

  onSearchVehicleHaveRFID() {
    const startDate = this.vehiclesHaveRFIDForm.value.dateRegistrationStart ? moment(this.vehiclesHaveRFIDForm.value.dateRegistrationStart).format(COMMOM_CONFIG.DATE_FORMAT) : null;
    const endDate = this.vehiclesHaveRFIDForm.value.dateRegistrationEnd ? moment(this.vehiclesHaveRFIDForm.value.dateRegistrationEnd).format(COMMOM_CONFIG.DATE_FORMAT) : null;
    let data = {
      startrecord: 0,
      pagesize: 10
    }

    if (startDate) {
      data['startDate'] = startDate;
    }
    if (endDate) {
      data['endDate'] = endDate;
    }
    this.getDatatableHaveRFID(this.detailContract.contractId, data);
  }

  getDatatableHaveRFID(contractId, data?) {
    this._vehicleRegisterService.getListVehicle(contractId, data).subscribe(res => {
      while (this.listDataHaveRFID.length > 0) {
        this.listDataHaveRFID.pop();
      }
      res.data.listData.forEach(vehicle => {
        let groupVehicleName = '';
        const findVehicle = this.listOptionGroupVehicles.find(x => x.code == vehicle.vehicleGroupId);
        if (findVehicle) {
          groupVehicleName = findVehicle.value;
        }
        const objVehicle = {
          ...vehicle,
          licensePlates: vehicle.plateNumber,
          serialNumber: vehicle.rfidSerial,
          vehiclesTypeFee: groupVehicleName
        }
        this.listDataHaveRFID.push(objVehicle);
      });
      this.countTableHaveRFID = res.data.count;
      this.selectionHaveRFID.clear();
      this.listSelectedHaveRFID = [];
      this.renderTableHaveRFID();
    });
  }

  onSearchNotRfid() {
    const startDate = this.vehiclesNotRFIDForm.value.dateRegistrationStart ? moment(this.vehiclesNotRFIDForm.value.dateRegistrationStart).format(COMMOM_CONFIG.DATE_FORMAT) : '';
    const endDate = this.vehiclesNotRFIDForm.value.dateRegistrationEnd ? moment(this.vehiclesNotRFIDForm.value.dateRegistrationEnd).format(COMMOM_CONFIG.DATE_FORMAT) : '';
    let data = {
      startrecord: 0,
      pagesize: 10,
      vehicleImportType: 3
    }

    if (startDate) {
      data['startDate'] = startDate;
    }
    if (endDate) {
      data['endDate'] = endDate;
    }
    this.getDataTableFromImportFile(data, this.detailContract.contractId);
  }

  getDataTableFromImportFile(data?, contractId?) {
    this._vehicleRegisterService.searchVehiclesNotAssignRFID(data, contractId).subscribe(res => {
      if(res.mess.code == HTTP_CODE.SUCCESS){
        this.listDataNotRFID =res.data.listData.map(x=>{
          x.vehiclesType = this.listOptionVehicleType.find(v => v.id == x.vehicleTypeId)?.value??'';
          return x;
        });
      }
      this.selectionNotRFID.clear();
      this.listSelectedNotRFID = [];
      this.countTableNotRFID = res.data.count;
      this.renderTableNotRFID();
    })
  }

  backToRegister() {
    this.backToRegisterForm.emit(false);
    this.routeStore.changeBackToRegisterVehicle(null);
  }

  addVehicle() {
    this.routeStore.changeBackToRegisterVehicle(true);
  }

  assignRFIDModal(record?, componentTemplate?) {
    const dialog = this.dialog.open({
      width: '400px',
      data: { record },
    }, componentTemplate);

    dialog.afterClosed().subscribe(res => {
      if (res) {
        let arrAssignRFID = [];
        this.listSelectedNotRFID.forEach(ele => {
          const obj = {
            vehicleId: ele.vehicleId
          }
          arrAssignRFID.push(obj);
        })
        const body = {
          startRfidSerial: res,
          actTypeId: ACTION_TYPE.GAN_THE,
          addVehicleRequestDTOS: arrAssignRFID
        }
        this._vehicleRegisterService.assignRfid(this.detailCustomer.custId, this.detailContract.contractId, body).subscribe(res => {
          if (res.list.length > 0) {
            const dataNotRFID = {
              startrecord: 0,
              pagesize: 10,
              vehicleImportType: 3
            }
            this.getDataTableFromImportFile(dataNotRFID, this.detailContract.contractId);
            const dataHaveRFID = {
              startrecord: 0,
              pagesize: 10
            }
            this.getDatatableHaveRFID(this.detailContract.contractId, dataHaveRFID);
            let arrRfidSuccess = [];
            let arrRfidFail = [];
            res.list.forEach(rfid => {
              if (rfid.descriptions == 'SUCCESS') {
                arrRfidSuccess.push(rfid.rfidSerial);
              } else {
                arrRfidFail.push(rfid.rfidSerial);
              }
            });
            if (arrRfidSuccess.length > 0) {
              this.toastr.success(this.translateService.instant('common.assign-rfid-success') + arrRfidSuccess.join(','));
            }
            if (arrRfidFail.length > 0) {
              this.toastr.error(this.translateService.instant('common.assign-rfid-fail') + arrRfidFail.join(','));
            }
          }
        }, err => {
          this.toastr.error(this.translateService.instant('common.500Error'));
        })
      }
    });
  }

  assignRFID() {
    if (this.listSelectedNotRFID.length > 0) {
      this.assignRFIDModal(null, AssignRfidDialogComponent);
    } else {
      this.toastr.warning(this.translateService.instant('common.not-select-vehicle'));
    }

  }

  checkVehicle() {
      const data = this.listDataNotRFID.filter(x => x.status !== STATUS_VEHICLE.KHOP);
      if (data.length > 0) {
        const body = {
          data
        };
      this._vehicleRegisterService.vehicleRegisterInfor(body).subscribe(res => {
        if (res.mess.code == HTTP_CODE.SUCCESS) {
          const dataNotRFID = {
            startrecord: 0,
            pagesize: 10,
            vehicleImportType: 3
          }
          this.getDataTableFromImportFile(dataNotRFID, this.detailContract.contractId);
        } else {
          this.toastr.warning(res.mess.description);
        }
      });
    } else {
      this.toastr.warning(this.translateService.instant('common.not-select-rfid'));
    }
  }

  exportVehicle() {
    this._vehicleRegisterService.vehicleAssignedExport(this.detailContract.contractId).subscribe(res => {
      saveAs(res, this.translateService.instant('common.download-rfid'));
    }, err => {
      this.toastr.error(this.translateService.instant('common.500Error'));
    })
  }

  activeCard() {
    const body = {
      custId: this.detailCustomer.custId,
      actTypeId: ACTION_TYPE.KICHHOATTHE
    }
    let listActive: number[] = [] as number[];
    this.listSelectedHaveRFID.forEach(element => {
      listActive.push(element.vehicleId);
    });
    this._vehicleRegisterService.activeMutilRFID(body, listActive).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        let listVehicleActiveSuccess = [];
        let listVehicleActiveFail = [];
        res.data.activeResponses.forEach(element => {
          if (element.result == 'SUCCESS') {
            listVehicleActiveSuccess.push(element.rfidSerial);
          }
          if (element.result == 'FAIL') {
            listVehicleActiveFail.push(element.rfidSerial);
          }
        });
        if (listVehicleActiveSuccess.length > 0) {
          this.toastr.success(this.translateService.instant('common.active-rfid-success') + listVehicleActiveSuccess.join(','));
        }
        if (listVehicleActiveFail.length > 0) {
          this.toastr.warning(this.translateService.instant('common.active-rfid-fail') + listVehicleActiveFail.join(','));
        }
        const dataHaveRFID = {
          startrecord: 0,
          pagesize: 10
        }
        this.getDatatableHaveRFID(this.detailContract.contractId, dataHaveRFID);
      } else {
        this.toastr.error(this.translateService.instant('common.500Error'));
      }
    }, err => {
      this.toastr.error(this.translateService.instant('common.500Error'));
    })
  }

  renderTableNotRFID() {
    this.tableNotRFID.renderRows();
  }

  renderTableHaveRFID() {
    this.tableHaveRFID.renderRows();
  }

  ngOnDestroy() {
    this.routeStore.changeSendToCustomerInfor(null);
  }

}
