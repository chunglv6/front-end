import { Component, OnInit, Input, OnChanges, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MtxGridColumn, MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { VehicleService } from '@app/core/services/vehicle/vehicle.service';
import { SharedDirectoryService } from '@app/shared/services/shared-directory.service';
import { SelectOptionModel } from '@app/core/models/common.model';
import { CommonCRMService } from '@app/shared/services/common-crm.service';
import { MatTable } from '@angular/material/table';
import { ConfirmDialogModel, ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { ValidationService } from '@app/shared/common/validation.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ActivatedRoute } from '@angular/router';
import { RESOURCE } from '@app/core';
import { ACTION_TYPE, HTTP_CODE } from '@app/shared/constant/common.constant';
import { orderBy } from 'lodash';
import { COMMOM_CONFIG } from '@env/environment';

@Component({
  selector: 'app-vehicle-information-tab',
  templateUrl: './vehicle-information-tab.component.html',
  styleUrls: ['./vehicle-information-tab.component.scss']
})
export class VehicleInformationTabComponent extends BaseComponent implements OnInit, OnChanges {

  @Input() node: any;
  formChangeVehicle: FormGroup;
  columnsTotal: MtxGridColumn[];
  listOptionVehicelType: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionVehicleTypeFee: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionVehicleLabel: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionVehicleBrands: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionVehiclePlateTypes: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionVehicleColours: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionReason: SelectOptionModel[] = [] as SelectOptionModel[];
  detailVehicle: any;
  columnsFee: MtxGridColumn[];
  displayedColumnsFee = ['fee', 'price'];
  feeChangeInfo = 0;
  listDataTotal = [];
  @ViewChild('tableFee') tableFee: MatTable<any>;

  constructor(private fb: FormBuilder,
    public actr: ActivatedRoute,
    private _vehicleService: VehicleService,
    private _commonCRMService: CommonCRMService,
    private _sharedDirectoryService: SharedDirectoryService,
    protected translateService: TranslateService,
    private _changeVehicleService: VehicleService,
    public dialog?: MtxDialog,
    protected toastr?: ToastrService) {
    super(actr, null, RESOURCE.CUSTOMER);
  }

  ngOnInit() {
    this.buildForm();
    this.buildColumns();
    this.getReason();
    this.getFees(ACTION_TYPE.THAY_DOI_PT);
    this.getListVehicleType();
    this.getListVehicleFee();
    this.getListVehicleLabel();
    this.getListVehicleBrands();
    this.getListVehiclePlateTypes();
    this.getListVehicleColours();
    this.setDisable();
  }

  ngOnChanges(changes) {
    if (this.formChangeVehicle) {
      this.formChangeVehicle.get('reason').reset();
    }
    if (changes.node) {
      this.getDetailVehicle(this.node.vehicleId);
    }
  }

  buildForm() {
    this.formChangeVehicle = this.fb.group({
      licensePlates: ['', [Validators.required, Validators.maxLength(16), ValidationService.cannotWhiteSpace]],
      vehicleOwner: ['', [Validators.required, Validators.maxLength(255), ValidationService.cannotWhiteSpace]],
      vehicleTypeName: ['', Validators.required],
      vehicleWeight: ['', [Validators.min(0)]],
      merchandiseWeight: [''],
      vehiclesTypeFeeName: ['', Validators.required],
      allWeight: ['', [Validators.min(0), Validators.max(999999.99), Validators.pattern(COMMOM_CONFIG.NUMBER_WEIGHT_FORMAT)]],
      followWeight: ['', [Validators.min(0), Validators.max(999999.99), Validators.pattern(COMMOM_CONFIG.NUMBER_WEIGHT_FORMAT)]],
      seatsNumber: [''],
      vehicleNumber: ['', [Validators.maxLength(50), ValidationService.cannotWhiteSpace]],
      framesNumber: ['', [Validators.maxLength(50), ValidationService.cannotWhiteSpace]],
      color: [''],
      label: [''],
      vehiclesSeri: [''],
      licensePlateType: ['', Validators.required],
      staff: ['', Validators.required],
      seriNumber: ['', [Validators.maxLength(50), ValidationService.cannotWhiteSpace]],
      reason: ['', Validators.required]
    });
  }

  buildColumns() {
    this.translateService.get('customer-management.formCaculateChangeFee').subscribe(res => {
      this.columnsFee = [
        { i18n: res.feeType, field: 'fee', disabled: true },
        { i18n: res.price, field: 'price', disabled: true },
      ];
    });
  }

  format1(n) {
    return n.toFixed(0).replace(/./g, (c, i, a) => i > 0 && c !== '.' && (a.length - i) % 3 === 0 ? ',' + c : c);
  }

  setDisable() {
    this.formChangeVehicle.controls.licensePlates.disable();
    this.formChangeVehicle.controls.staff.disable();
    this.formChangeVehicle.controls.seriNumber.disable();
  }

  patchValueForm(valueForm) {
    this.formChangeVehicle.patchValue({
      licensePlates: valueForm.plateNumber,
      vehicleOwner: valueForm.owner,
      vehicleWeight: valueForm.netWeight,
      merchandiseWeight: valueForm.cargoWeight,
      allWeight: valueForm.grossWeight,
      followWeight: valueForm.pullingWeight,
      seatsNumber: valueForm.seatNumber,
      vehicleNumber: valueForm.engineNumber,
      framesNumber: valueForm.chassicNumber,
      staff: valueForm.createUser,
      seriNumber: valueForm.rfidSerial,
      vehicleTypeName: valueForm.vehicleTypeId,
      vehiclesTypeFeeName: valueForm.vehicleGroupId,
      label: valueForm.vehicleMarkId ? valueForm.vehicleMarkId : null,
      vehiclesSeri: valueForm.vehicleBrandId ? valueForm.vehicleBrandId : null,
      licensePlateType: valueForm.plateType ? valueForm.plateType : null,
      color: valueForm.vehicleColourId ? valueForm.vehicleColourId : null,
    });
  }

  getReason() {
    const actTypeId = 5;
    this._commonCRMService.getReason(actTypeId).subscribe(res => {
      this.listOptionReason = res.data.map(val => {
        return {
          code: val.id,
          value: val.name
        };
      });
    });
  }

  getFees(actionTypeId) {
    this._commonCRMService.getFees(actionTypeId).subscribe(res => {
      this.feeChangeInfo = res.data.fee;
      const fee = {
        fee: this.translateService.instant('common.fee-change-vehicle'),
        price: this.format1(res.data.fee)
      };
      this.listDataTotal.push(fee);
      const total = {
        fee: this.translateService.instant('common.total'),
        price: this.format1(res.data.fee)
      };
      this.listDataTotal.push(total);
      this.tableFee.renderRows();
    });
  }

  getDetailVehicle(vehicleId) {
    this._changeVehicleService.getDetailVehicle(vehicleId).subscribe(res => {
      this.detailVehicle = res;
      this.patchValueForm(res.data.listData[0]);
    });
  }

  getListVehicleType() {
    this._sharedDirectoryService.getListVehicleType().subscribe(res => {
      this.listOptionVehicelType = res.data.listData.map(val => {
        return {
          id: val.id,
          value: val.name,
          code: val.code
        };
      });
    });
  }

  getListVehicleFee() {
    this._sharedDirectoryService.getListVehicleFee().subscribe(res => {
      this.listOptionVehicleTypeFee = res.data.listData.map(val => {
        return {
          code: val.code,
          value: val.name + ' - ' + val.description,
          name: val.name,
          id: val.id
        };
      });
    });
  }

  getListVehicleLabel() {
    this._sharedDirectoryService.getListVehicleLabel().subscribe(res => {
      this.listOptionVehicleLabel = res.data.map(val => {
        return {
          code: val.id,
          value: val.val.trim()
        };
      });
      this.listOptionVehicleLabel = orderBy(this.listOptionVehicleLabel, ['value'], ['asc']);
    });
  }

  getListVehicleBrands() {
    this._sharedDirectoryService.getListVehicleBrands().subscribe(res => {
      this.listOptionVehicleBrands = res.data.map(val => {
        return {
          code: val.id,
          value: val.val.trim()
        };
      });
      this.listOptionVehicleBrands = orderBy(this.listOptionVehicleBrands, ['value'], ['asc']);
    });
  }

  getListVehiclePlateTypes() {
    this._sharedDirectoryService.getListVehiclePlateTypes().subscribe(res => {
      this.listOptionVehiclePlateTypes = res.data.map(val => {
        return {
          code: val.code,
          value: val.val.trim(),
          id: val.id,
          name: val.val
        };
      });
      this.listOptionVehiclePlateTypes = orderBy(this.listOptionVehiclePlateTypes, ['value'], ['asc']);
    });
  }

  getListVehicleColours() {
    this._sharedDirectoryService.getListVehicleColours().subscribe(res => {
      this.listOptionVehicleColours = res.data.map(val => {
        return {
          code: val.id,
          value: val.val.trim()
        };
      });
      this.listOptionVehicleColours = orderBy(this.listOptionVehicleColours, ['value'], ['asc']);
    });
  }

  confirmDialog(): void {
    const message = this.translateService.instant('common.confirm.update');
    const dialogData = new ConfirmDialogModel(this.translateService.instant('common.confirm.title.update'), message);
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        const valuePlateType = this.listOptionVehiclePlateTypes.find(element => element.id == this.formChangeVehicle.controls.licensePlateType.value);
        const valueVehicleType = this.listOptionVehicelType.find(element => element.id == this.formChangeVehicle.controls.vehicleTypeName.value);
        const valueVehicleTypeFee = this.listOptionVehicleTypeFee.find(element => element.id == this.formChangeVehicle.controls.vehiclesTypeFeeName.value);
        const body = {
          actTypeId: ACTION_TYPE.THAY_DOI_PT,
          cargoWeight: this.formChangeVehicle.value.merchandiseWeight,
          chassicNumber: this.formChangeVehicle.value.framesNumber ? this.formChangeVehicle.value.framesNumber?.trim() : '',
          engineNumber: this.formChangeVehicle.value.vehicleNumber ? this.formChangeVehicle.value.vehicleNumber?.trim() : '',
          grossWeight: this.formChangeVehicle.value.allWeight,
          netWeight: this.formChangeVehicle.value.vehicleWeight,
          owner: this.formChangeVehicle.value.vehicleOwner ? this.formChangeVehicle.value.vehicleOwner?.trim() : '',
          plateNumber: this.formChangeVehicle.controls.licensePlates.value ? this.formChangeVehicle.controls.licensePlates.value?.trim() : '',
          plateType: valuePlateType.id,
          plateTypeId: valuePlateType.id,
          plateTypeCode: valuePlateType.code,
          plateTypeName: valuePlateType.name,
          price: this.feeChangeInfo,
          amount: this.feeChangeInfo,
          pullingWeight: this.formChangeVehicle.value.followWeight,
          reasonId: this.formChangeVehicle.value.reason,
          rfidSerial: this.formChangeVehicle.value.seriNumber,
          seatNumber: this.formChangeVehicle.value.seatsNumber,
          vehicleBrandId: this.formChangeVehicle.value.vehiclesSeri,
          vehicleColourId: this.formChangeVehicle.value.color,
          vehicleGroupId: valueVehicleTypeFee.id,
          vehicleGroupCode: valueVehicleTypeFee.code,
          vehicleGroupName: valueVehicleTypeFee.name,
          vehicleMarkId: this.formChangeVehicle.value.label,
          vehicleTypeId: valueVehicleType.id,
          vehicleTypeCode: valueVehicleType.code,
          vehicleTypeName: valueVehicleType.name,
        };
        this._vehicleService.updateVehicle(this.node.custId, this.node.contractId, this.node.vehicleId, body).subscribe(res => {
          if (res.mess.code == HTTP_CODE.SUCCESS) {
            this.toastr.success(this.translateService.instant('common.notify.update-vehicle'));
          } else {
            this.toastr.error(this.translateService.instant(res.mess.description));
          }
        }, err => {
          this.toastr.error(this.translateService.instant('common.500Error'));
        });
      }
    });
  }

  updateVehicle() {
    this.confirmDialog();
  }

  onResetForm() {
    this.getDetailVehicle(this.node.vehicleId);
    this.formChangeVehicle.get('reason').reset();
  }
  getDefaultVehicleGroup() {
    const data = {
      vehicleTypeId: this.formChangeVehicle.get('vehicleTypeName').value ?? null,
      seatNumber: this.formChangeVehicle.get('seatsNumber').value ?? null,
      cargoWeight: this.formChangeVehicle.get('merchandiseWeight').value ?? null,
      netWeight: this.formChangeVehicle.get('vehicleWeight').value ?? null,
      grossWeight: this.formChangeVehicle.get('allWeight').value ?? null,
      pullingWeight: this.formChangeVehicle.get('followWeight').value ?? null
    }
    this._sharedDirectoryService.getVehicleGroupType(data).subscribe(rs => {
      if (rs.mess.code === HTTP_CODE.SUCCESS) {
        const idDefault = this.listOptionVehicleTypeFee.find(x => x.id == rs.data.vehicleGroupId)?.id;
        this.formChangeVehicle.controls.vehiclesTypeFeeName.setValue(idDefault);
      } else {
        this.formChangeVehicle.controls.vehiclesTypeFeeName.setValue(null);
      }
    })
  }
}
