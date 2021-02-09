// author hieulx

import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { RESOURCE } from '@app/core/app-config';
import { CreateVehicleSuccessModel, SelectOptionModel } from '@app/core/models/common.model';
import { ContractRegisterModel, CustomerInforModel, InforRegisterVehicleModel } from '@app/core/models/customer-register.model';
import { AppStorage } from '@app/core/services/AppStorage';
import { ContractService } from '@app/core/services/contract/contract.service';
import { VehicleService } from '@app/core/services/vehicle/vehicle.service';
import { RegisterServicesStore } from '@app/routes/register-services/register-services.store';
import { RouteStore } from '@app/routes/routes.store';
import { ValidationService } from '@app/shared/common/validation.service';
import { AttachFileComponent } from '@app/shared/components/attach-file/attach-file.component';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { ImportListVehiclesComponent } from '@app/shared/components/import-list-vehicles/import-list-vehicles.component';
import { ViewFileImageComponent } from '@app/shared/components/view-file-image/view-file-image.component';
import { ViewFilePdfComponent } from '@app/shared/components/view-file-pdf/view-file-pdf.component';
import { ACTION_TYPE, HTTP_CODE, PLATE_TYPE_COLOR } from '@app/shared/constant/common.constant';
import { CommonCRMService } from '@app/shared/services/common-crm.service';
import { SharedDirectoryService } from '@app/shared/services/shared-directory.service';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxGridColumn } from '@ng-matero/extensions';
import { MtxDialog } from '@ng-matero/extensions/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, tap } from 'rxjs/operators';
@Component({
  selector: 'appendix-contract-appendix',
  templateUrl: './appendix-contract-appendix.component.html',
  styleUrls: ['./appendix-contract-appendix.component.scss'],
})
export class SignAppendixContractSignAppendixComponent extends BaseComponent implements OnInit {

  selectedDocument: number;
  listOptionLicense: SelectOptionModel[] = [] as SelectOptionModel[];
  formSearch: FormGroup;
  selectContract: any = {};
  states = [];
  value: string;
  filteredStates = this.states;
  selection = new SelectionModel<any>(true, []);

  listOptionVehicelType: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionVehicleTypeFee: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionVehicleColours: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionVehicleLabel: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionVehicleBrands: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionVehiclePlateTypes: SelectOptionModel[] = [] as SelectOptionModel[];

  appendixDateString = new Date(Date.now());
  @Input() contractId: number;
  @Input() customerId: number;
  @ViewChild('plateNumber') plateNumber: ElementRef;
  @ViewChild('serialNumber') serialNumber: ElementRef;

  dataFormCustomerInfor: CustomerInforModel;
  detailRegisterVehicle: InforRegisterVehicleModel;
  dataFormContractInfor: ContractRegisterModel;

  listDataProfile = [];
  displayedColumnsProfile = ['stt', 'documentType', 'documentName', 'actionDelete'];
  dataSourceProfile = new MatTableDataSource<any>(this.listDataProfile);
  columnsProfile: MtxGridColumn[];
  @ViewChild('tableProfile') tableProfile: MatTable<any>;
  @ViewChild(MatPaginator, { static: true }) paginatorProfile: MatPaginator;
  indexPaginator = 0;
  pageSizeList = [10, 20, 50, 100];

  signDate: string;
  effDate: string;
  expDate: string;
  formInformation: FormGroup;
  isLoadingAuto: boolean;
  formatDate = COMMOM_CONFIG.DATE_FORMAT;

  constructor(
    private routeStore: RouteStore,
    private _sharedDirectoryService: SharedDirectoryService,
    protected translateService: TranslateService,

    private _registerServicesStore: RegisterServicesStore,
    private _vehicleRegisterService: VehicleService,
    private _contractService: ContractService,
    protected _translate: TranslateService,
    private _toastrService: ToastrService,

    public actr: ActivatedRoute,
    public dialog: MtxDialog,
    private fb: FormBuilder,
    private _contractsInfoService: ContractService,
    private _commonCRMService: CommonCRMService,
    private _router?: Router
  ) {
    super(actr, _contractService, RESOURCE.CONTRACT);
  }

  ngOnInit() {
    this.formInformation = this.fb.group({
      searchContract: ['', Validators.required],
    });

    this.formSearch = this.fb.group({
      plateNumber: ['', [Validators.required, Validators.maxLength(16), ValidationService.cannotWhiteSpace, Validators.pattern(COMMOM_CONFIG.PLATE_NUMBER_FORMAT)]],
      owner: ['', [Validators.required, Validators.maxLength(255), ValidationService.cannotWhiteSpace]],
      vehicleTypeId: ['', Validators.required],
      netWeight: ['', [Validators.min(0), Validators.max(999999.99), Validators.pattern(COMMOM_CONFIG.NUMBER_WEIGHT_FORMAT)]],
      cargoWeight: ['', [Validators.min(0), Validators.max(999999.99), Validators.pattern(COMMOM_CONFIG.NUMBER_WEIGHT_FORMAT)]],
      vehicleGroupId: ['', Validators.required],
      grossWeight: ['', [Validators.min(0), Validators.max(999999.99), Validators.pattern(COMMOM_CONFIG.NUMBER_WEIGHT_FORMAT)]],
      pullingWeight: ['', [Validators.min(0), Validators.max(999999.99), Validators.pattern(COMMOM_CONFIG.NUMBER_WEIGHT_FORMAT)]],
      seatNumber: ['', [Validators.required, Validators.max(999), Validators.min(0), Validators.pattern(COMMOM_CONFIG.SEAT_NUMBER_FORMAT)]],
      engineNumber: ['', [Validators.maxLength(50), ValidationService.cannotWhiteSpace]],
      chassicNumber: ['', [Validators.maxLength(50), ValidationService.cannotWhiteSpace]],
      vehicleColourId: [''],
      vehicleMarkId: [''],
      vehicleBrandId: [''],
      plateType: ['', Validators.required],
      createUser: [AppStorage.getUserLogin(), Validators.required],
      rfidSerial: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('^[a-zA-Z0-9]+$')]],

      documentTypeId: [''],

      appendixUsername: ['', [Validators.required, ValidationService.cannotWhiteSpace, Validators.maxLength(255)]],
      contractAppendix: [''],
      appendixDate: [''],
      appendixDateString: [new Date(Date.now()), Validators.required],
    });
    this.getListVehicleType();
    this.getListVehicleFee();
    this.getListVehicleColours();
    this.getListVehicleLabel();
    this.getListVehicleBrands();
    this.getListVehiclePlateTypes();
    this.getListDocumentTypeObject();
    this.subscribleStore();
    super.mapColumn();

    this.formInformation.get('searchContract').valueChanges.pipe(debounceTime(1000), tap(() => { this.isLoadingAuto = true; this.filteredStates = []; })).subscribe(value => {
      if (typeof value !== 'object') {
        this._contractsInfoService.searchContractInfo(value?.trim()).subscribe(rs => {
          this.isLoadingAuto = false;
          this.filteredStates = rs.data.listData;
        });
      }
    });
  }

  inItColumns() {
    this.translateService.get('customer-management.updateProfileTable').subscribe(res => {
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
    this.confirmDialogDeleteProfile(i);
  }

  // confirmDialogDeleteProfile(i): void {
  //   const message = this.translateService.instant('common.confirm.delete-file');
  //   const dialogData = new ConfirmDialogModel(this.translateService.instant('common.confirm.title.delete'), message);
  //   const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
  //     maxWidth: "400px",
  //     data: dialogData
  //   });

  //   dialogRef.afterClosed().subscribe(dialogResult => {
  //     if (dialogResult) {
  //       this.listDataProfile.splice(i + this.indexPaginator, 1);
  //       this.renderTable();
  //     }
  //   });
  // }

  confirmDialogDeleteProfile(i) {
    this.listDataProfile.splice(i + this.indexPaginator, 1);
    this.renderTable();
  }

  onKeypressSerialNumber(value) {
    const key = value.key;
    if (!(key >= 0 || key <= 9)) {
      return false;
    }
  }

  confirmDialog(value?: any): void {
    const dialogData = new ConfirmDialogModel(this.translateService.instant('customer.notification'), this.translateService.instant('contractNew.confirm-appendix-contract'));

    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.onSave();
      }
    });
  }

  async filter(value: any) {
    if (typeof value === 'object') {
      return;
    }
    this.filteredStates = [];
    const data = (await this._contractsInfoService.searchContractInfo(value?.trim()).toPromise()).data;
    if (data.listData.length > 0) {
      this.filteredStates.push(data.listData[0]);
    }
    return this.filteredStates;
  }
  getOptionText(option) {
    if (option) {
      return option.contractNo;
    }
  }
  onSelectedContract(event) {
    this.selectContract = event.option.value;
    this.signDate = this.selectContract.signDate ? this.selectContract.signDate.split(' ')[0] : null;
    this.effDate = this.selectContract.effDate ? this.selectContract.effDate.split(' ')[0] : null;
    this.expDate = this.selectContract.expDate ? this.selectContract.expDate.split(' ')[0] : null;
  }

  getListVehicleType() {
    if (AppStorage.get('vehicle-type')) {
      this.listOptionVehicelType = AppStorage.get('vehicle-type').map(val => {
        return {
          id: val.id,
          code: val.code,
          value: val.name
        };
      });
    }
  }

  getListVehicleFee() {
    if (AppStorage.get('vehicle-group')) {
      this.listOptionVehicleTypeFee = AppStorage.get('vehicle-group').map(val => {
        return {
          id: val.id,
          code: val.code,
          value: val.name
        };
      });
    }
  }

  getListVehicleColours() {
    if (AppStorage.get('vehicle-color')) {
      this.listOptionVehicleColours = AppStorage.get('vehicle-color').map(val => {
        return {
          code: val.id,
          value: val.val
        };
      });
    }
  }

  getListVehicleLabel() {
    if (AppStorage.get('vehicle-mark')) {
      this.listOptionVehicleLabel = AppStorage.get('vehicle-mark').map(val => {
        return {
          code: val.id,
          value: val.val
        };
      });
    }
  }

  getListVehicleBrands() {
    if (AppStorage.get('vehicle-brands')) {
      this.listOptionVehicleBrands = AppStorage.get('vehicle-brands').map(val => {
        return {
          code: val.id,
          value: val.val
        };
      });
    }
  }

  getListVehiclePlateTypes() {
    if (AppStorage.get('plate-types')) {
      this.listOptionVehiclePlateTypes = AppStorage.get('plate-types').map(val => {
        return {
          id: val.id,
          code: val.code,
          value: val.val
        };
      });
      const defaultId = this.listOptionVehiclePlateTypes.find(x => x.code == PLATE_TYPE_COLOR.WHITE)?.id;
      this.formSearch.controls.plateType.setValue(defaultId);
    }
  }

  getListDocumentTypeObject() {
    this._commonCRMService.getListDocumentTypeObject(ACTION_TYPE.DANG_KY_PT).subscribe(res => {
      this.listOptionLicense = res.data.map(val => {
        return {
          id: Number(val.id),
          value: val.val
        };
      });
    });
  }

  chooseFileChange(event) {
    this.chooseFileModal(event, AttachFileComponent);
  }
  chooseFileModal(record?, componentTemplate?) {
    const dialog = this.dialog.open({
      panelClass: 'my-dialog',
      width: '600px',
      data: { record },
    }, componentTemplate);

    dialog.afterClosed().subscribe(res => {
      if (res) {
        // lọc ra tên file theo id trong danh sách file
        let licenseName;
        const documentSelected = this.formSearch.controls.documentTypeId.value;
        if (documentSelected) {
          licenseName = this.listOptionLicense.filter(license => license.id == documentSelected)[0].value;
        } else {
          licenseName = '';
        }
        res.forEach(file => {
          const license = {
            documentType: licenseName,
            documentTypeId: this.selectedDocument,
            documentName: file.fileName,
            fileName: file.fileName,
            fileSize: file.fileSize,
            fileBase64: file.fileBase64,
            fullBase64: file.fullBase64
          };
          this.listDataProfile.push(license);
        });
        this.renderTable();
      }
    });
  }

  patchValueForm(formValue) {
    this.formSearch.patchValue({
      owner: formValue.owner,
      vehicleTypeId: formValue.vehicleTypeId,
      netWeight: formValue.netWeight,
      seatNumber: formValue.seatNumber,
      cargoWeight: formValue.cargoWeight,
      grossWeight: formValue.grossWeight,
      pullingWeight: formValue.pullingWeight,
      vehicleGroupId: formValue.vehicleGroupId,
      engineNumber: formValue.engineNumber,
      chassicNumber: formValue.chassicNumber,
      vehicleColourId: formValue.vehicleColourId,
      vehicleMarkId: formValue.vehicleMarkId,
      vehicleBrandId: formValue.vehicleBrandId
    });
    this.getVehicleGroupType();
  }
  getVehicleGroupType() {
    const data = {
      vehicleTypeId: this.formSearch.get('vehicleTypeId').value ?? null,
      seatNumber: this.formSearch.get('seatNumber').value ?? null,
      cargoWeight: this.formSearch.get('cargoWeight').value ?? null,
      netWeight: this.formSearch.get('netWeight').value ?? null,
      grossWeight: this.formSearch.get('grossWeight').value ?? null,
      pullingWeight: this.formSearch.get('pullingWeight').value ?? null
    };
    this._sharedDirectoryService.getVehicleGroupType(data).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.formSearch.get('vehicleGroupId').patchValue(res.data.vehicleGroupId);
      } else if (res.mess.code == HTTP_CODE.NOT_EXIT_VEHICLE_GROUP) {
        this.formSearch.controls.vehicleGroupId.reset();
      }
    });
  }

  onSearchVehicle(event) {
    const value = event.target.value;
    const key = event.key;
    const upperValue = value.toUpperCase();
    this.formSearch.get('plateNumber').patchValue(upperValue);
    if (key == 'Enter') {
      this.getVehicleRegistyInfo(value);
    }
  }

  getVehicleRegistyInfo(plateNumber) {
    let concat = plateNumber;
    const colorCode = this.listOptionVehiclePlateTypes.find(x => x.id === this.formSearch.controls.plateType.value)?.code;
    switch (colorCode) {
      case PLATE_TYPE_COLOR.WHITE: {
        concat = `${concat}T`;
        break;
      }
      case PLATE_TYPE_COLOR.YELLOW: {
        concat = `${concat}V`;
        break;
      }
      case PLATE_TYPE_COLOR.BLUE: {
        concat = `${concat}X`;
        break;
      }
    }
    this._vehicleRegisterService.getVehicleRegistry(concat).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS && res.data) {
        this.patchValueForm(res.data);
      }
    });
  }

  onSaveAppendix() {
    this.confirmDialog();
  }

  onSave() {
    this.formSearch.value.appendixUsername = this.formSearch.value.appendixUsername ? this.formSearch.value.appendixUsername?.trim() : '';
    this.formSearch.value.plateNumber = this.formSearch.value.appendixUsername ? this.formSearch.value.plateNumber?.trim() : '';
    this.formSearch.value.owner = this.formSearch.value.appendixUsername ? this.formSearch.value.owner?.trim() : '';
    this.formSearch.value.engineNumber = this.formSearch.value.appendixUsername ? this.formSearch.value.engineNumber?.trim() : '';
    this.formSearch.value.chassicNumber = this.formSearch.value.appendixUsername ? this.formSearch.value.chassicNumber?.trim() : '';
    const param = this.formSearch.value;
    let vehicleGroupCode = null;
    const findVehicleGroup = this.listOptionVehicleTypeFee.find(x => x.id == this.formSearch.get('vehicleGroupId').value);
    if (findVehicleGroup) {
      vehicleGroupCode = findVehicleGroup.code;
    }
    let plateTypeCode = null;
    const findPlateType = this.listOptionVehiclePlateTypes.find(x => x.id == this.formSearch.get('plateType').value);
    if (findPlateType) {
      plateTypeCode = findPlateType.code;
    }
    let vehicleTypeCode = null;
    let vehicleTypeName = '';
    const findVehicleType = this.listOptionVehicelType.find(x => x.id == this.formSearch.get('vehicleTypeId').value);
    if (findVehicleType) {
      vehicleTypeCode = findVehicleType.code;
      vehicleTypeName = findVehicleType.value;
    }

    const body: any = {
      actTypeId: ACTION_TYPE.KYPHULUCHOPDONG,
      vehicleGroupCode,
      plateTypeCode,
      vehicleTypeCode,
      vehicleTypeName,

      vehicleProfileDTOs: this.listDataProfile.map(x => {
        return {
          documentTypeId: x.documentTypeId,
          fileName: x.fileName,
          fileBase64: x.fileBase64
        };
      }),
    };
    const model = Object.assign(body, param);
    this._contractService.appendixContracts(model, this.selectContract.custId, this.selectContract.contractId).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        const objTransfer: CreateVehicleSuccessModel = {
          customerId: this.selectContract.custId,
          contractId: this.selectContract.contractId,
          vehicleId: res.data.vehicleId
        };
        this._router.navigate(['register-services']);
        this.routeStore.fireEventImportVehicle(objTransfer);
        this.routeStore.changeImportVehicleSuccess(true);
        this._toastrService.success(this._translate.instant('contractNew.success-appendix-contract'));
      } else {
        this._toastrService.warning(res.mess.description);
      }
    }, err => {
      this.toastr.error(this._translate.instant('common.500Error'));
    });
  }

  resetFormSearch() {
    this.formSearch.reset();
    this.selectContract = {};
    this.value = null;
    this.dataSourceProfile = null;
    this.formInformation.reset();
    this.effDate = null;
    this.expDate = null;
    this.signDate = null;
  }

  importFileModal(record?, componentTemplate?) {
    const dialog = this.dialog.open({
      width: '900px',
      data: { record },
    }, componentTemplate);

    dialog.afterClosed().subscribe(res => {
      if (res) {
        const objTransfer: CreateVehicleSuccessModel = {
          customerId: this.selectContract.custId,
          contractId: this.selectContract.contractId
        };
        this.routeStore.fireEventImportVehicle(objTransfer);
        this.routeStore.changeImportVehicleSuccess(true);
        this._router.navigate(['register-services']);
      }
    });
  }

  importFileVehicle() {
    const record = {
      customerId: this.selectContract.custId ? this.selectContract.custId : this.selectContract.custId,
      contractId: this.selectContract.contractId ? this.selectContract.contractId : this.selectContract.contractId,
    };
    this.importFileModal(record, ImportListVehiclesComponent);
  }

  subscribleStore() {
    this.routeStore.sendInforRegisterVehicle$.subscribe((res: InforRegisterVehicleModel) => {
      if (res) {
        this.detailRegisterVehicle = res;
      }
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
