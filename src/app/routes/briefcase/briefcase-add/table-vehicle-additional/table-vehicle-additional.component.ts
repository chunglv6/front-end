import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BriefCaseService, VehicleService } from '@app/core';
import { CommonCRMService } from '@app/shared';
import { AttachFileComponent } from '@app/shared/components/attach-file/attach-file.component';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogModel,
} from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { CrmTableComponent } from '@app/shared/components/table-component/table-component.component';
import { ACTION_TYPE, HTTP_CODE } from '@app/shared/constant/common.constant';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-table-vehicle-additional',
  templateUrl: './table-vehicle-additional.component.html',
  styleUrls: ['./table-vehicle-additional.component.css'],
})
export class TableVehicleAdditionalComponent extends BaseComponent implements OnInit {
  @Input() contractId: number;
  @Input() customerId: number;
  @Input() vehicleId: number;
  listOptionLicense = [];
  @ViewChild('crmtable') crmTable: CrmTableComponent;
  @Input() dataChanges: any;
  selectLicence: number;
  @Input() actTypeId: number;
  constructor(
    protected _translateService: TranslateService,
    public actr: ActivatedRoute,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
    public _vehicleService?: VehicleService,
    public _briefCaseService?: BriefCaseService,
    private _toastrService?: ToastrService,
    private _commonCRMService?: CommonCRMService
  ) {
    super();
  }
  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer-management.updateProfileTable.documentType', field: 'documentTypeName' },
      { i18n: 'customer-management.updateProfileTable.documentName', field: 'fileName' },
      { i18n: 'common.action', field: 'option' },
    ];
    super.mapColumn();
    this.getListDocumentType();
    this.getData();
  }
  getData() {
    this.isLoading = true;
    this.searchModel.actTypeId = ACTION_TYPE.BO_SUNG_PT;
    delete this.searchModel.pagesize;
    this._vehicleService.searchVehicleProfiles(this.searchModel, this.vehicleId).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        this.dataModel.dataSource = res.data.listData;
        this.totalRecord = res.data.count;
        this.isLoading = false;
      } else {
        this._toastrService.warning(res.mess.description);
      }
    },
      error => {
        this._toastrService.error(this._translateService.instant('common.notify.fail'));
      });
  }
  getListDocumentType() {
    this._commonCRMService.getListDocumentTypeObject(ACTION_TYPE.DANG_KY_PT).subscribe(res => {
      this.listOptionLicense = res.data.map(val => {
        return {
          id: Number(val.id),
          value: val.val,
        };
      });
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
      const documentSelected = this.selectLicence;
      if (documentSelected) {
        licenseName = this.listOptionLicense.find(license => license.id === documentSelected).value;
      } else {
        licenseName = '';
      }
      if (res) {
        res.forEach(file => {
          const license = {
            documentTypeName: licenseName,
            documentTypeId: documentSelected,
            documentName: file.fileName,
            fileName: file.fileName,
            fileSize: file.fileSize,
            fileBase64: file.fileBase64,
          };
          this.dataModel.dataSource.push(license);
          this.totalRecord = this.dataModel.dataSource.length;
        });
        this.crmTable.renderTable();
      }
    });
  }

  removeSelectedFile(item, i) {
    if (item.vehicleProfileId) {
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
          // nếu có trong db thì xóa gọi api
          const body = {
            actionTypeId: ACTION_TYPE.BO_SUNG_PT,
            reasonId: 10,
            custId: this.customerId,
            contractId: this.contractId,
            vehicleProfiles: [
              {
                vehicleProfileId: item.vehicleProfileId,
                fileName: item.fileName,
              },
            ],
          };
          this._vehicleService
            .deleteProfileVehicle(this.vehicleId, item.vehicleProfileId, body)
            .subscribe(
              rs => {
                if (rs.mess.code === HTTP_CODE.SUCCESS) {
                  dialogRef.close();
                  this.getData();
                  this._toastrService.success(
                    this._translateService.instant('common.notify.save.success')
                  );
                } else {
                  this._toastrService.warning(rs.mess.description);
                }
              },
              error => {
                this._toastrService.error(this._translateService.instant('common.notify.fail'));
              });
        }
      });
    } else {
      // xóa ở client
      this.dataModel.dataSource.splice(i, 1);
      this.totalRecord = this.dataModel.dataSource.length;
      this.crmTable.renderTable();
    }
  }

  downLoadFile(item) {
    this._vehicleService.downloadProfileByVehicle(item.vehicleProfileId).subscribe(
      data => {
        saveAs(data, item.fileName);
      },
      err => {
        this._toastrService.warning(this._translateService.instant('common.notify.fail'));
      }
    );
  }
  onUpdateVehicleProfile() {
    const dialogData = new ConfirmDialogModel(
      this._translateService.instant('common.button.confirm'),
      this._translateService.instant('policy.question-accept')
    );
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const body = {
          actTypeId: ACTION_TYPE.BO_SUNG_PT,
          contractId: this.contractId,
          custId: this.customerId,
          reasonId: 10,
          vehicleProfiles: this.dataModel.dataSource.filter(f => !f.vehicleProfileId),
        };
        this._vehicleService.updateProfileVehicles(this.vehicleId, body).subscribe(
          rs => {
            if (rs.mess.code === HTTP_CODE.SUCCESS) {
              this._toastrService.success(
                this._translateService.instant('common.notify.save.success')
              );
            } else {
              if (rs.mess.code === HTTP_CODE.STATUS_ERROR) {
                this._toastrService.warning(
                  this._translateService.instant('briefcase.status_error')
                );
              } else {
                this._toastrService.warning(this._translateService.instant('common.notify.fail'));
              }
            }
          },
          error => {
            this._toastrService.error(this._translateService.instant(error.mess.description));
          }
        );
      }
    });
  }
}
