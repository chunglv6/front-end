import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core/app-config';
import { CreateVehicleSuccessModel, SelectOptionModel } from '@app/core/models/common.model';
import { ContractRegisterModel, CustomerInforModel, InforRegisterVehicleModel, VehicleRegisterModel } from '@app/core/models/customer-register.model';
import { AppStorage } from '@app/core/services/AppStorage';
import { VehicleService } from '@app/core/services/vehicle/vehicle.service';
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
import { MtxDialog, MtxGridColumn } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RegisterServicesStore } from '../register-services.store';

@Component({
  selector: 'app-register-vehicle-service',
  templateUrl: './register-vehicle-service.component.html',
  styleUrls: ['./register-vehicle-service.component.scss']
})
export class RegisterVehicleServiceComponent extends BaseComponent implements OnInit, OnDestroy {
  isLoginToken = AppStorage.getLoginByToken();
  newVehicleRegisterForm: FormGroup;
  updateProfileForm: FormGroup;
  columnsProfile: MtxGridColumn[];
  listOptionVehicelType: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionVehicleTypeFee: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionVehicleLabel: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionVehicleBrands: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionVehiclePlateTypes: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionVehicleColours: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionLicense: SelectOptionModel[] = [] as SelectOptionModel[];
  dataFormCustomerInfor: CustomerInforModel;
  dataFormContractInfor: ContractRegisterModel;
  listDataProfile = [];
  columns_profile: MtxGridColumn[];
  @ViewChild('serialNumber') serialNumber: ElementRef;
  @ViewChild('tableProfile') tableProfile: MatTable<any>;
  @ViewChild('plateNumber') plateNumber: ElementRef;
  displayedColumns_profile = ['stt', 'documentType', 'documentName', 'actionDelete'];
  displayedColumnsFee = ['name', 'fee'];
  detailRegisterVehicle: InforRegisterVehicleModel;
  dataSourceProfile = new MatTableDataSource<any>(this.listDataProfile);
  @ViewChild(MatPaginator, { static: true }) paginatorProfile: MatPaginator;
  pageSizeList = [10, 20, 50, 100];
  indexPaginator = 0;
  dataSourceFee = [];
  @ViewChild('tableFee') tableFee: MatTable<any>;
  isDestroy = new Subject();
  constructor(
    private _commonCRMService: CommonCRMService,
    private routeStore: RouteStore,
    private _vehicleRegisterService: VehicleService,
    private _sharedDirectoryService: SharedDirectoryService,
    private registerServicesStore: RegisterServicesStore,
    public actr: ActivatedRoute,
    private fb: FormBuilder,
    protected translateService: TranslateService,
    protected toastr: ToastrService,
    public dialog?: MtxDialog
  ) {
    super(actr, _vehicleRegisterService, RESOURCE.CUSTOMER);

  }
  ngOnDestroy(): void {
    this.isDestroy.next();
    this.isDestroy.complete();
  }

  ngOnInit() {
    this.buildForm();
    this.getListVehicleType();
    this.getListVehicleFee();
    this.getListVehicleLabel();
    this.getListVehicleBrands();
    this.getListVehiclePlateTypes();
    this.getListVehicleColours();
    this.getListLicense();
    this.subscribleStore();
    this.setDisable();
    // this.changeDataSeatNumber();
    // this.changeDataMerchandiseWeight();
    // this.changeDataVehicleWeight();
    // this.changeDataAllWeight();
    // this.changeDataFollowWeight();
    // this.changeDataVehicleType();
    // this.changeDataLicense();
    // this.changeDataGroupVehicle();
    // this.changeDataColor();
    // this.changeDataLabel();
    // this.changeDataVehiclesSeri();
    this.dataSourceProfile.paginator = this.paginatorProfile;
    if (AppStorage.getLoginByToken()) {
      this.newVehicleRegisterForm.controls.licensePlates.setValue(this.dataFormCustomerInfor?.plateNumberVtp);
    }
  }

  buildForm() {
    this.newVehicleRegisterForm = this.fb.group({
      vehicleId: [''],
      licensePlates: ['', [Validators.required, Validators.maxLength(16), ValidationService.cannotWhiteSpace, Validators.pattern(COMMOM_CONFIG.PLATE_NUMBER_FORMAT)]],
      vehicleOwner: ['', [Validators.required, Validators.maxLength(255), ValidationService.cannotWhiteSpace]],
      vehicleType: ['', Validators.required],
      vehicleWeight: ['', [Validators.min(0), Validators.max(999999.99), Validators.pattern(COMMOM_CONFIG.NUMBER_WEIGHT_FORMAT)]],
      merchandiseWeight: ['', [Validators.min(0), Validators.max(999999.99), Validators.pattern(COMMOM_CONFIG.NUMBER_WEIGHT_FORMAT)]],
      vehiclesTypeFee: ['', Validators.required],
      allWeight: ['', [Validators.min(0), Validators.max(999999.99), Validators.pattern(COMMOM_CONFIG.NUMBER_WEIGHT_FORMAT)]],
      followWeight: ['', [Validators.min(0), Validators.max(999999.99), Validators.pattern(COMMOM_CONFIG.NUMBER_WEIGHT_FORMAT)]],
      seatsNumber: ['', [Validators.required, Validators.max(999), Validators.min(0), Validators.pattern(COMMOM_CONFIG.SEAT_NUMBER_FORMAT)]],
      vehicleNumber: ['', [Validators.maxLength(50), ValidationService.cannotWhiteSpace]],
      framesNumber: ['', [Validators.maxLength(50), ValidationService.cannotWhiteSpace]],
      color: [''],
      label: [''],
      vehiclesSeri: [''],
      licensePlateType: ['', Validators.required],
      staff: [AppStorage.getUserLogin()],
      seriNumber: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('^[a-zA-Z0-9]+$')]],
      promotionCode: ['']
    });
    // nếu login bằng token (VTP)
    if (this.isLoginToken) {
      this.newVehicleRegisterForm.controls.promotionCode.disable();
      this.dataModel.promotionCode = AppStorage.get('promotion_code');
      this.newVehicleRegisterForm.controls.promotionCode.setValue(this.dataModel.promotionCode?.split(':')[0] || null);
      // mặc định 20k tiền ship
      this.dataSourceFee.push(
        {
          name: this.translateService.instant('vtpost.shipping-fee'),
          fee: AppStorage.get('order_number') ? 20000 : 0
        }
      );
    }
    this.getTotalCost();
    this.updateProfileForm = this.fb.group({
      license: ['']
    });
    this.newVehicleRegisterForm.controls.licensePlates.valueChanges.pipe(takeUntil(this.isDestroy)).subscribe(rs => {
      this.dataModel.canSave = false;
    }),
      this.newVehicleRegisterForm.controls.licensePlateType.valueChanges.pipe(takeUntil(this.isDestroy)).subscribe(rs => {
        this.dataModel.canSave = false;
      })
  }

  patchValueForm(formValue) {
    this.newVehicleRegisterForm.patchValue({
      vehicleOwner: formValue?.owner,
      vehicleType: formValue?.vehicleTypeId,
      vehicleWeight: formValue?.netWeight,
      merchandiseWeight: formValue?.cargoWeight,
      allWeight: formValue?.grossWeight,
      followWeight: formValue?.pullingWeight,
      seatsNumber: formValue?.seatNumber,
      vehicleNumber: formValue?.engineNumber,
      framesNumber: formValue?.chassicNumber,
      color: formValue?.vehicleColourId,
      label: formValue?.vehicleMarkId,
      vehiclesSeri: formValue?.vehicleBrandId
    });
    this.getVehicleGroupType();
  }

  setDisable() {
    // this.newVehicleRegisterForm.controls['vehiclesTypeFee'].disable();
  }
  getVehicleGroupType() {
    const data = {
      vehicleTypeId: this.newVehicleRegisterForm.get('vehicleType').value || '',
      seatNumber: this.newVehicleRegisterForm.get('seatsNumber').value || '',
      cargoWeight: this.newVehicleRegisterForm.get('merchandiseWeight').value || '',
      netWeight: this.newVehicleRegisterForm.get('vehicleWeight').value || '',
      grossWeight: this.newVehicleRegisterForm.get('allWeight').value || '',
      pullingWeight: this.newVehicleRegisterForm.get('followWeight').value || ''
    };
    this._sharedDirectoryService.getVehicleGroupType(data).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.newVehicleRegisterForm.get('vehiclesTypeFee').patchValue(res.data.vehicleGroupId);
      } else if (res.mess.code == HTTP_CODE.NOT_EXIT_VEHICLE_GROUP) {
        this.newVehicleRegisterForm.controls.vehiclesTypeFee.reset();
      }
    }, error => {
      this.newVehicleRegisterForm.controls.vehiclesTypeFee.reset();
    });
  }

  subscribleStore() {
    this.registerServicesStore.currentCustomerInfor$.pipe(takeUntil(this.isDestroy)).subscribe((res: CustomerInforModel) => {
      this.dataFormCustomerInfor = res;
    });

    this.registerServicesStore.currentContractInfor$.pipe(takeUntil(this.isDestroy)).subscribe((res: ContractRegisterModel) => {
      this.dataFormContractInfor = res;
    });

    this.routeStore.sendInforRegisterVehicle$.pipe(takeUntil(this.isDestroy)).subscribe((res: InforRegisterVehicleModel) => {
      if (res) {
        this.detailRegisterVehicle = res;
      }
    });
  }

  onSearchVehicle() {
    this.getVehicleRegistyInfo();
  }

  getVehicleRegistyInfo() {
    let concat = this.newVehicleRegisterForm.value.licensePlates;
    const colorCode = this.listOptionVehiclePlateTypes.find(x => x.id === this.newVehicleRegisterForm.controls.licensePlateType.value)?.code;
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
      if (res.mess.code == HTTP_CODE.SUCCESS && res.data) {
        this.patchValueForm(res.data);

      } else {
        this.patchValueForm(null);
      }
    });
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
      this.newVehicleRegisterForm.controls.licensePlateType.setValue(defaultId);
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

  getListLicense() {
    this._commonCRMService.getListDocumentTypeObject(ACTION_TYPE.DANG_KY_PT).subscribe(res => {
      this.listOptionLicense = res.data.map(val => {
        return {
          code: Number(val.id),
          value: val.val
        };
      });
    });
  }

  importFileModal(record?, componentTemplate?) {
    const dialog = this.dialog.open({
      width: '900px',
      data: { record },
      disableClose: true,
    }, componentTemplate);

    dialog.afterClosed().subscribe(res => {
    });
  }

  importFileVehicle() {
    const record = {
      customerId: this.detailRegisterVehicle ? this.detailRegisterVehicle.customerId : this.dataFormCustomerInfor.customerCode,
      contractId: this.detailRegisterVehicle ? this.detailRegisterVehicle.contractId : this.dataFormContractInfor.newContractInforForm.contractId
    };
    this.importFileModal(record, ImportListVehiclesComponent);
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

  deleteProfile(i) {
    this.listDataProfile.splice(i + this.indexPaginator, 1);
    this.renderTable();
  }

  resetFormRegister() {
    this.newVehicleRegisterForm.reset();
    this.updateProfileForm.reset();
    this.newVehicleRegisterForm.get('staff').patchValue(AppStorage.getUserLogin());
  }

  onKeypressSerialNumber(value) {
    const key = value.key;
    if (!(key >= 0 || key <= 9)) {
      return false;
    }
  }

  onSaveVehicleInfor() {
    const objValueForm: VehicleRegisterModel = {
      isSave: true,
      newVehicleRegisterForm: this.newVehicleRegisterForm.value,
      updateProfileForm: this.updateProfileForm.value
    };
    this.confirmDialog(objValueForm);
  }

  confirmDialog(value: any): void {
    const message = this.translateService.instant('dialog.content-register-vehicle');
    const dialogData = new ConfirmDialogModel(this.translateService.instant('dialog.title-register-vehicle'), message);
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '500px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        let vehicleGroupCode = null;
        const findVehicleGroup = this.listOptionVehicleTypeFee.find(x => x.id == this.newVehicleRegisterForm.get('vehiclesTypeFee').value);
        if (findVehicleGroup) {
          vehicleGroupCode = findVehicleGroup.code;
        }
        let plateTypeCode = null;
        const findPlateType = this.listOptionVehiclePlateTypes.find(x => x.id == this.newVehicleRegisterForm.get('licensePlateType').value);
        if (findPlateType) {
          plateTypeCode = findPlateType.code;
        }
        let vehicleTypeCode = null;
        let vehicleTypeName = '';
        const findVehicleType = this.listOptionVehicelType.find(x => x.id == this.newVehicleRegisterForm.get('vehicleType').value);
        if (findVehicleType) {
          vehicleTypeCode = findVehicleType.code;
          vehicleTypeName = findVehicleType.value;
        }
        const listFile = this.listDataProfile.map(val => {
          return {
            documentTypeId: val.documentTypeId,
            fileName: val.fileName,
            fileSize: val.fileSize,
            fileBase64: val.fileBase64
          };
        });
        const body: any = {
          plateNumber: this.newVehicleRegisterForm.value.licensePlates ? this.newVehicleRegisterForm.value.licensePlates?.trim() : '',
          vehicleTypeId: this.newVehicleRegisterForm.value.vehicleType,
          vehicleGroupId: this.newVehicleRegisterForm.value.vehiclesTypeFee,
          seatNumber: this.newVehicleRegisterForm.value.seatsNumber,
          netWeight: this.newVehicleRegisterForm.value.vehicleWeight,
          grossWeight: this.newVehicleRegisterForm.value.allWeight,
          cargoWeight: this.newVehicleRegisterForm.value.merchandiseWeight,
          pullingWeight: this.newVehicleRegisterForm.value.followWeight,
          chassicNumber: this.newVehicleRegisterForm.value.framesNumber?.trim(),
          engineNumber: this.newVehicleRegisterForm.value.vehicleNumber?.trim(),
          vehicleMarkId: this.newVehicleRegisterForm.value.label ? Number(this.newVehicleRegisterForm.value.label) : null,
          vehicleBrandId: this.newVehicleRegisterForm.value.vehiclesSeri ? Number(this.newVehicleRegisterForm.value.vehiclesSeri) : null,
          vehicleColourId: this.newVehicleRegisterForm.value.color ? Number(this.newVehicleRegisterForm.value.color) : null,
          plateTypeId: this.newVehicleRegisterForm.value.licensePlateType ? Number(this.newVehicleRegisterForm.value.licensePlateType) : null,
          rfidSerial: this.newVehicleRegisterForm.value.seriNumber + '',
          owner: this.newVehicleRegisterForm.value.vehicleOwner ? this.newVehicleRegisterForm.value.vehicleOwner?.trim() : '',
          contractNo: this.detailRegisterVehicle ? this.detailRegisterVehicle.contractNo : this.dataFormContractInfor.newContractInforForm.contractNumber,
          actTypeId: ACTION_TYPE.DANG_KY_PT,
          vehicleProfileDTOs: listFile,
          vehicleGroupCode,
          plateTypeCode,
          vehicleTypeCode,
          vehicleTypeName,
          promotionCode: this.newVehicleRegisterForm.value.promotionCode,
          orderNumber: AppStorage.get('order_number') ?? null,
          vtpUsername: this.dataModel.promotionCode?.split(':')[0] || null,
          vtpMaBuuCuc: this.dataModel.promotionCode?.split(':')[1] || null,
          contractPrice: this.dataSourceFee[0].fee,
        };
        const customerId = this.detailRegisterVehicle ? this.detailRegisterVehicle.customerId : this.dataFormCustomerInfor.customerCode;
        const contractId = this.detailRegisterVehicle ? this.detailRegisterVehicle.contractId : this.dataFormContractInfor.newContractInforForm.contractId;
        this._vehicleRegisterService.vehicleRegister(customerId, contractId, body).subscribe(res => {
          if (res.mess.code == HTTP_CODE.SUCCESS) {
            const objTransfer: CreateVehicleSuccessModel = {
              customerId: this.detailRegisterVehicle ? this.detailRegisterVehicle.customerId : this.dataFormCustomerInfor.customerCode,
              contractId: this.detailRegisterVehicle ? this.detailRegisterVehicle.contractId : this.dataFormContractInfor.newContractInforForm.contractId,
              vehicleId: res.data.vehicleId
            };
            this.registerServicesStore.changeCreateVehicleSuccess(objTransfer);
            this.registerServicesStore.changeNextToCustomerManage(true);

            this.toastr.success(this.translateService.instant('common.registerVehicleSuccess'));
            this.clearDataCacheVehicle();
            AppStorage.set('step-register-service', null);
          } else {
            if (res.mess.code == HTTP_CODE.ALREADY_EXIST_PLATE_NUMBER) {
              this.plateNumber.nativeElement.focus();
              this.toastr.error(res.mess.description);
            } else {
              if (res.mess.code == HTTP_CODE.SERIAL_NOT_FOUND) {
                this.serialNumber.nativeElement.focus();
                this.toastr.error(res.mess.description);
              } else {
                this.toastr.error(res.mess.description);
              }
            }
          }
        }, err => {
          this.toastr.error(this.translateService.instant('common.500Error'));
        });
      }
    });
  }
  chooseFileChange(event) {
    this.chooseFileModal(event, AttachFileComponent);
  }

  chooseFileModal(record?, componentTemplate?) {
    const dialog = this.dialog.open({
      width: '600px',
      data: { record },
    }, componentTemplate);

    dialog.afterClosed().subscribe(res => {
      const licenseName = this.updateProfileForm.value.license ? this.listOptionLicense.filter(license => license.code == this.updateProfileForm.value.license)[0].value : '';
      let stt = 1;
      res.forEach(file => {
        const license = {
          stt: stt++,
          documentType: licenseName,
          documentTypeId: this.updateProfileForm.value.license,
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

  onPaginateChange(event) {
    this.indexPaginator = event.pageIndex * event.pageSize;
  }

  renderTable() {
    this.dataSourceProfile.paginator = this.paginatorProfile;
    this.tableProfile.renderRows();
  }

  // access cache data
  cacheLicensePlates() {
    this.getVehicleRegistyInfo();
  }

  clearDataCacheVehicle() {
    if (this.isLoginToken) {
      AppStorage.set('order_number', null);
    }
  }
  checkFee() {
    let plateTypeCode = null;
    const findPlateType = this.listOptionVehiclePlateTypes.find(x => x.id == this.newVehicleRegisterForm.get('licensePlateType').value);
    if (findPlateType) {
      plateTypeCode = findPlateType.code;
    }
    this._vehicleRegisterService.checkFee(this.newVehicleRegisterForm.value.licensePlates, plateTypeCode).subscribe(rs => {
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        if (!this.isLoginToken) {
          this.dataSourceFee = [
            {
              name: this.translateService.instant('vtpost.connect-fee'),
              fee: rs.data.fee
            }
          ]
        } else {
          if (this.dataSourceFee.length == 2) {
            this.dataSourceFee[0].fee = rs.data.fee;
          } else {
            this.dataSourceFee.unshift({
              name: this.translateService.instant('vtpost.connect-fee'),
              fee: rs.data.fee
            });
            this.tableFee.renderRows();
          }

        }
        this.getTotalCost();
        this.dataModel.canSave = rs.data.fee != null;
      } else {
        this.toastr.error(rs.mess.description)
      }
    }, error => {
      this.toastr.error(error.mess.description)
    });
  }
  getTotalCost() {
    this.dataModel.totalFee = this.dataSourceFee.reduce((x, y) => x + y.fee, 0);
  }

}
