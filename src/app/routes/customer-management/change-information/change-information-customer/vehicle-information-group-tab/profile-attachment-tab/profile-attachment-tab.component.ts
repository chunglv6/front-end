import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { ContractService, RESOURCE, VehicleService } from '@app/core';
import { SelectOptionModel } from '@app/core/models/common.model';
import { CommonCRMService } from '@app/shared';
import { AttachFileComponent } from '@app/shared/components/attach-file/attach-file.component';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { ACTION_TYPE } from '@app/shared/constant/common.constant';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { orderBy } from 'lodash';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-profile-attachment-tab',
  templateUrl: './profile-attachment-tab.component.html',
  styleUrls: ['./profile-attachment-tab.component.scss']
})
export class ProfileAttachmentTabComponent extends BaseComponent implements OnChanges, OnInit {
  listOptionLicense: SelectOptionModel[] = [] as SelectOptionModel[];
  @Input() node: any;
  formInfo: FormGroup;
  selectLicence: number;
  listDataProfile = [];
  dataSourceProfile = new MatTableDataSource<any>(this.listDataProfile);
  displayedColumnsProfile = ['stt', 'documentType', 'documentName', 'actionDelete'];
  @ViewChild('tableProfile') tableProfile: MatTable<any>;
  @ViewChild(MatPaginator, { static: true }) paginatorProfile: MatPaginator;
  pageSizeList = [10, 20, 50, 100];
  indexPaginator = 0;


  constructor(
    private _commonCRMService: CommonCRMService,
    protected _contractService: ContractService,
    public dialog: MtxDialog,
    private fb: FormBuilder,
    protected _activatedRoute: ActivatedRoute,
    protected _translateService: TranslateService,
    protected _toastrService: ToastrService,
    protected _vehicleProfileService: VehicleService
  ) {
    super(_activatedRoute, null, RESOURCE.CONTRACT, _toastrService, _translateService);
  }
  ngOnInit() {
    this.formInfo = this.fb.group({
      license: [''],
    });
    this.getListDocumentType();
    this.dataSourceProfile.paginator = this.paginatorProfile;
  }

  ngOnChanges() {
    this.processSearchVehicleProfile();
  }

  onPaginateChange(event) {
    this.indexPaginator = event.pageIndex * event.pageSize;
  }

  public processSearchVehicleProfile(): void {
    this._vehicleProfileService.searchVehicleProfiles(null, this.node.vehicleId)
      .subscribe(res => {
        if (res.mess.code == 1) {
          while (this.listDataProfile.length > 0) {
            this.listDataProfile.pop();
          }
          res.data.listData.forEach(element => {
            const obj = {
              ...element,
              documentType: element.documentTypeName,
              documentName: element.fileName
            };
            this.listDataProfile.push(obj);
          });
          this.renderTable();
        } else {
          this.toastr.error(this.translateService.instant('common.notify.fail'));
        }
      });
  }

  getListDocumentType() {
    this._commonCRMService.getListDocumentTypeObject(ACTION_TYPE.DANG_KY_PT).subscribe(res => {
      this.listOptionLicense = res.data.map(val => {
        return {
          id: Number(val.id),
          value: val.val
        };
      });
      this.listOptionLicense = orderBy(this.listOptionLicense, ['value'], ['desc']);
    });
  }

  confirmDialog(value: any): void {
    const message = this._translateService.instant('common.confirm.delete');

    const dialogData = new ConfirmDialogModel(
      this._translateService.instant('common.confirm.title.delete'),
      message
    );

    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
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
      let licenseName;
      const documentSelected = this.formInfo.controls.license.value;
      if (documentSelected) {
        licenseName = this.listOptionLicense.find(license => license.id == documentSelected).value;
      } else {
        licenseName = '';
      }
      res.forEach(file => {
        const license = {
          documentTypeName: licenseName,
          documentTypeId: documentSelected,
          documentName: file.fileName,
          fileName: file.fileName,
          fileSize: file.fileSize,
          fileBase64: file.fileBase64,
          action: 'add'
        };
        this.listDataProfile.push(license);
        this.totalRecord = this.listDataProfile.length;
      });
      this.renderTable();
      this.onUpdateVehicleFile();
    });
  }

  removeSelectedFile(item, i) {
    const dialogData = new ConfirmDialogModel(this.translateService.instant('common.confirm.title.delete'), this.translateService.instant('common.confirm.delete'));
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (item?.action != 'add') {
          // nếu có trong db thì xóa gọi api
          const body = {
            actTypeId: ACTION_TYPE.THAY_DOI_PT,
            reasonId: 1,
            custId: this.node.custId,
            contractId: this.node.contractId,
            vehicleProfiles: [{
              vehicleProfileId: item.vehicleProfileId,
              fileName: item.fileName
            }]
          };
          this._vehicleProfileService.deleteProfileVehicle(this.node.vehicleId, item.vehicleProfileId, body).subscribe(rs => {
            if (rs.mess.code == 1) {
              this._toastrService.success(this.translateService.instant('common.notify.save.success'));
              this.processSearchVehicleProfile();
            } else {
              this._toastrService.warning(rs.mess.description);
            }
          }, err => {
            this._toastrService.warning(this.translateService.instant('common.notify.fail'));
            this.processSearchVehicleProfile();
          });
        } else {
          // xóa ở client
          this.listDataProfile.splice(i, 1);
          this._toastrService.success(this.translateService.instant('common.notify.save.success'));
          this.totalRecord = this.listDataProfile.length;
          this.renderTable();
        }
      }
    });
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

  onUpdateVehicleFile() {
    const listProfileAdd = [];
    this.listDataProfile.forEach(element => {
      if (element?.action == 'add') {
        const obj = {
          fileName: element.fileName,
          fileSize: element.fileSize,
          fileBase64: element.fileBase64,
          documentTypeId: element.documentTypeId
        };
        listProfileAdd.push(obj);
      }
    });
    if (listProfileAdd.length > 0) {
      const body = {
        contractId: this.node.contractId,
        custId: this.node.custId,
        actTypeId: ACTION_TYPE.THAY_DOI_PT,
        reasonId: 1,
        vehicleProfiles: listProfileAdd
      };
      this._vehicleProfileService.updateProfileVehicles(this.node.vehicleId, body).subscribe(rs => {
        if (rs.mess.code == 1) {
          this._toastrService.success(this._translateService.instant('common.notify.save.success'));
          this.processSearchVehicleProfile();
        } else {
          this._toastrService.warning(rs.mess.description);
        }
      }, err => {
        this.processSearchVehicleProfile();
        this._toastrService.error(this._translateService.instant('common.notify.fail'));
      });
    } else {
      this.toastr.error(this.translateService.instant('common.not-select-file'));
    }
  }

  renderTable() {
    this.dataSourceProfile.paginator = this.paginatorProfile;
    this.tableProfile.renderRows();
  }

}
