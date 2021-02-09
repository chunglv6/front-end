import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { RESOURCE, VehicleService } from '@app/core';
import { AppStorage } from '@app/core/services/AppStorage';
import { CommonCRMService } from '@app/shared';
import { ValidationService } from '@app/shared/common/validation.service';
import { AttachFileComponent } from '@app/shared/components/attach-file/attach-file.component';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogModel,
} from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { CrmTableComponent } from '@app/shared/components/table-component/table-component.component';
import { ACTION_TYPE, HTTP_CODE } from '@app/shared/constant/common.constant';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { iif, Subscription } from 'rxjs';
import { debounceTime, finalize, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-change-card-rfid',
  templateUrl: './change-card-rfid.component.html',
  styleUrls: ['./change-card-rfid.component.css'],
})
export class ChangeCardRfidComponent extends BaseComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private _vehicleService: VehicleService,
    private _commonCRMService: CommonCRMService,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    public dialog: MtxDialog,
    protected _vehicleProfileService: VehicleService
  ) {
    super(null, _vehicleService, RESOURCE.RFID);
    this.dataModel.dataSourceProfile = [];
  }
  listPlateNumber = [];
  dataReasonType = [];
  @ViewChild('tableFee') tableFee: MatTable<any>;
  columnProfiles = [];
  displayColumnProfiles = [];
  @ViewChild('crmtable') crmTable: CrmTableComponent;
  isLoadingProfile: boolean;
  _sub: Subscription;
  listDocument = [];
  totalCost = 0;
  vehicleProfileIdDelete = [];
  ngOnDestroy(): void {
    this._sub.unsubscribe();
  }

  ngOnInit() {
    this.columnProfiles = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'customer-management.updateProfileTable.documentType', field: 'documentTypeNamedataModel.dataSourceProfile' },
      { i18n: 'customer-management.updateProfileTable.documentName', field: 'fileName' },
      { i18n: 'common.action', field: 'actions', type: 'custom' },
    ];
    this.displayedColumns = ['fee', 'price'];
    // build reactform
    this.formSearch = this.fb.group({
      vehicle: ['', Validators.required],
      rfidSerial: [
        '',
        [Validators.required, Validators.maxLength(50), ValidationService.cannotWhiteSpace, Validators.pattern('^[a-zA-Z0-9]+$')],
      ],
      staff: [AppStorage.getUserLogin()],
      dateChange: [moment(new Date()).format(COMMOM_CONFIG.DATE_FORMAT)],
      reason: [null, Validators.required],
      typeChange: ['1'],
      documentType: [null],
    });
    // xử lý autocomplete
    this.formSearch
      .get('vehicle')
      .valueChanges.pipe(
        debounceTime(1000),
        tap(x => {
          this.isLoading = true;
          this.listPlateNumber = [];
          if (!x || x === '') {
            this.dataModel.dataSourceProfile = [];
            this.totalRecord = 0;
          }
        }),
        switchMap(value =>
          iif(
            () => typeof value !== 'object' && value && value !== '',
            this._vehicleService.getVehiclesByPlateNumber({ plateNumber: value, pagesize: 20 })
          ).pipe(finalize(() => (this.isLoading = false)))
        )
      )
      .subscribe(rs => {
        this.listPlateNumber = rs.data.listData;
      });
    this.getReason();
    this.getFees();
    this.changeType();
    this.getListDocumentType();
  }
  changeType() {
    this._sub = this.formSearch.controls.typeChange.valueChanges.subscribe(rs => {
      if (this.formSearch.controls.typeChange.value === '2') {
        this.formSearch.addControl(
          'newPlate',
          new FormControl('', [
            Validators.required,
            Validators.maxLength(16),
            ValidationService.cannotWhiteSpace,
            Validators.pattern(COMMOM_CONFIG.PLATE_NUMBER_FORMAT)
          ])
        );
        this.formSearch.removeControl('rfidSerial');
      }
      if (this.formSearch.controls.typeChange.value === '1') {
        this.formSearch.addControl(
          'rfidSerial',
          new FormControl('', [
            Validators.required,
            Validators.maxLength(50),
            ValidationService.cannotWhiteSpace,
          ])
        );
        this.formSearch.removeControl('newPlate');
      }
      this.getReason();
      this.getFees();
    });
  }
  getReasonChangePlate() {
    // something here
  }
  displayFn(vehicle: any) {
    if (vehicle) {
      return vehicle.plateNumber;
    }
  }
  getReason() {
    this._commonCRMService
      .getReason(
        this.formSearch.controls.typeChange.value === '1'
          ? ACTION_TYPE.CHUYENTHE
          : ACTION_TYPE.THAY_DOI_PT
      )
      .subscribe(res => {
        this.dataReasonType = res.data;
      });
  }
  onResetForm() {
    this.formSearch.controls.vehicle.reset();
    this.formSearch.controls.rfidSerial.reset();
    this.formSearch.controls.reason.reset();
    this.formSearch.markAsUntouched();
    this.formSearch.markAsPristine();
  }
  onSave() {
    const dialogData = new ConfirmDialogModel(
      this._translateService.instant('customer.notification'),
      this._translateService.instant('customer.action')
    );
    const changeDialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      width: '25%',
      data: dialogData,
    });
    changeDialogRef.afterClosed().subscribe(rs => {
      if (rs) {
        if (this.formSearch.controls.typeChange.value === '1') {
          this.swapRFID();
        } else {
          this.swapPlateNumber();
        }
      }
    });
  }
  /**
   * đổi thẻ rfid
   */
  swapRFID() {
    const rfidDTO = {
      custId: this.formSearch.controls.vehicle.value.custId,
      serialRFID: this.formSearch.controls.rfidSerial.value,
      reasonId: this.formSearch.controls.reason.value,
      userLogin: this.formSearch.controls.staff.value,
      actTypeId: ACTION_TYPE.CHUYENTHE,
      amount: this.totalCost,
      vehicleProfiles: this.dataModel.dataSourceProfile.filter(x => !x.vehicleProfileId),
      vehicleProfileIdDelete: this.vehicleProfileIdDelete
    };
    this._vehicleService
      .swapRFID(this.formSearch.controls.vehicle.value.vehicleId, rfidDTO)
      .subscribe(
        rs => {
          if (rs.mess.code === HTTP_CODE.SUCCESS) {
            this._toastrService.success(
              this._translateService.instant('change_card.notifi-change-rfid-success')
            );
            this.formSearch.controls.rfidSerial.reset();
            this.formSearch.controls.reason.reset();
            this.formSearch.markAsPristine();
            this.formSearch.markAsUntouched();
            this.vehicleProfileIdDelete = [];
            this.searchVehicleProfile();
          } else {
            this._toastrService.error(this._translateService.instant(rs.mess.description));
          }
        },
        error => {
          this._toastrService.error(error.mess.description);
        }
      );
  }
  /**
   * đổi biển số xe
   */
  swapPlateNumber() {
    const vehicleSwapPlateNumberDTO = {
      actTypeId: ACTION_TYPE.DOI_BIEN,
      amount: this.totalCost,
      newPlateNumber: this.formSearch.controls.newPlate.value,
      reasonId: this.formSearch.controls.reason.value,
      vehicleProfileDTOs: this.dataModel.dataSourceProfile.filter(x => !x.vehicleProfileId),
      vehicleProfileIdDelete: this.vehicleProfileIdDelete
    };
    this._vehicleProfileService
      .swapPlateNumber(this.formSearch.controls.vehicle.value.vehicleId, vehicleSwapPlateNumberDTO)
      .subscribe(
        rs => {
          if (rs.mess.code === HTTP_CODE.SUCCESS) {
            this.dataModel.dataSourceProfile = [];
            this.dataModel.dataSource = [];
            this.totalCost = 0;
            this.totalRecord = 0;
            this._toastrService.success(
              this._translateService.instant('change_card.notifi-change-plate-success')
            );
            this.formSearch.reset();
            this.formSearch.controls.staff.setValue(AppStorage.getUserLogin());
            this.formSearch.controls.dateChange.setValue(moment(new Date()).format(COMMOM_CONFIG.DATE_FORMAT));
            this.formSearch.controls.typeChange.setValue('2');
            this.vehicleProfileIdDelete = [];
            this.searchVehicleProfile();
          } else {
            this._toastrService.warning(this._translateService.instant(rs.mess.description));
          }
        },
        err => {
          this._toastrService.error(this._translateService.instant(err.mess.description));
        }
      );
  }
  getFees() {
    this.dataModel.dataSource = [];
    this._commonCRMService
      .getFees(
        this.formSearch.controls.typeChange.value === '1'
          ? ACTION_TYPE.CHUYENTHE
          : ACTION_TYPE.THAY_DOI_PT
      )
      .subscribe(res => {
        const feeType = {
          fee: this._translateService.instant('contract.fee_change_title'),
          price: res.data.fee,
        };
        this.totalCost = res.data.fee;
        this.dataModel.dataSource = [...[feeType]];
      });
  }
  onSelectedVehicle() {
    this.searchVehicleProfile();
  }

  downLoadFile(item) {
    this._vehicleProfileService.downloadProfileVehicle(item.vehicleProfileId).subscribe(
      data => {
        saveAs(data, item.fileName);
      },
      err => {
        this._toastrService.warning(this._translateService.instant('common.notify.fail'));
      }
    );
  }

  removeSelectedFile(item, i) {
    const dialogData = new ConfirmDialogModel(
      this._translateService.instant('common.confirm.title.delete'),
      this._translateService.instant('common.confirm.delete')
    );
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (item.vehicleProfileId) {
          // có trong db thì add vào mảng để xóa
          this.vehicleProfileIdDelete.push(item.vehicleProfileId)
        }
        // xóa ở client
        this.dataModel.dataSourceProfile.splice(i, 1);
        this._toastrService.success(this._translateService.instant('common.notify.save.success'));
        this.totalRecord = this.dataModel.dataSourceProfile.length;
        this.crmTable.renderTable();
      }
    });
  }
  // lấy danh sách giấy tờ
  searchVehicleProfile() {
    this.isLoadingProfile = true;
    this._vehicleProfileService
      .searchVehicleProfiles(null, this.formSearch.controls.vehicle.value.vehicleId)
      .subscribe(rs => {
        if (rs.mess.code === HTTP_CODE.SUCCESS) {
          this.dataModel.dataSourceProfile = rs.data.listData;
          this.totalRecord = rs.data.count;
          this.isLoadingProfile = false;
        }
      });
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
      let licenseName;
      if (this.formSearch.controls.documentType.value) {
        licenseName = this.listDocument.find(
          x => x.id === this.formSearch.controls.documentType.value
        ).value;
      } else {
        licenseName = '';
      }
      res.forEach(file => {
        const license = {
          documentTypeName: licenseName,
          documentTypeId: this.formSearch.controls.documentType.value,
          documentName: file.fileName,
          fileName: file.fileName,
          fileSize: file.fileSize,
          fileBase64: file.fileBase64,
        };
        this.dataModel.dataSourceProfile.push(license);
        this.totalRecord = this.dataModel.dataSourceProfile.length;
      });
      this.crmTable.renderTable();
    });
  }

  getListDocumentType() {
    this._commonCRMService.getListDocumentTypeObject(ACTION_TYPE.DANG_KY_PT).subscribe(res => {
      this.listDocument = res.data.map(val => {
        return {
          id: Number(val.id),
          value: val.val,
        };
      });
    });
  }
}
