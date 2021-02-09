import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { ContractService, RESOURCE } from '@app/core';
import { SelectOptionModel } from '@app/core/models/common.model';
import { VehicleService } from '@app/core/services/vehicle/vehicle.service';
import { AttachFileComponent } from '@app/shared/components/attach-file/attach-file.component';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogModel,
} from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { CrmTableComponent } from '@app/shared/components/table-component/table-component.component';
import { ACTION_TYPE, HTTP_CODE } from '@app/shared/constant/common.constant';
import { SharedDirectoryService } from '@app/shared/services/shared-directory.service';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contract-profile-change-info',
  templateUrl: './contract-profile.component.html',
  styleUrls: ['./contract-profile.component.css'],
})
export class ContractProfileComponent extends BaseComponent implements OnInit, OnChanges {
  listOptionLicense: SelectOptionModel[] = [] as SelectOptionModel[];
  @ViewChild(MatTable) table: MatTable<any>;
  listDataProfileRefresh = [];
  @Input() node: any;
  dataSourceTree: [];
  formInfo: FormGroup;
  @ViewChild('crmtable') crmTable: CrmTableComponent;
  selectLicence: number;
  constructor(
    protected _contractService: ContractService,
    public dialog: MtxDialog,
    private _sharedDirectoryService: SharedDirectoryService,
    private fb: FormBuilder,
    protected _activatedRoute: ActivatedRoute,
    protected _translateService: TranslateService,
    protected _toastrService: ToastrService,
    protected _vehicleProfileService: VehicleService,
    private _contractProfile?: ContractService,
    private _cd?: ChangeDetectorRef
  ) {
    super(_activatedRoute, null, RESOURCE.CONTRACT, _toastrService, _translateService);
  }
  ngOnInit() {
    this.formInfo = this.fb.group({
      license: [''],
    });

    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer-management.updateProfileTable.documentType', field: 'documentTypeName' },
      { i18n: 'customer-management.updateProfileTable.documentName', field: 'fileName' },
      { i18n: 'common.action', field: 'actions' },
    ];
    this.getListDocumentType();
    super.mapColumn();
  }

  public processSearchContractProfile(): void {
    this.isLoading = true;
    this._contractProfile
      .searchContractProfiles({ actTypeId: ACTION_TYPE.DANG_KY_KH }, this.node.contractId)
      .subscribe(res => {
        if (res.mess.code === HTTP_CODE.SUCCESS) {
          this.dataModel.dataSource = res.data.listData;
          this.totalRecord = res.data.count;
          this.isLoading = false;
          this._cd.detectChanges();
        } else {
          this.toastr.error(this.translateService.instant('common.notify.fail'));
        }
      });
  }
  ngOnChanges() {
    this.processSearchContractProfile();
  }

  getListDocumentType() {
    this._sharedDirectoryService.getListDocumentType().subscribe(res => {
      this.listOptionLicense = res.data.map(val => {
        return {
          id: Number(val.id),
          value: val.val,
        };
      });
    });
  }

  confirmDialog(): void {
    const message = this._translateService.instant('common.confirm.delete');

    const dialogData = new ConfirmDialogModel(
      this._translateService.instant('common.confirm.title.delete'),
      message
    );

    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData,
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
    const dialog = this.dialog.open(
      {
        width: '600px',
        data: { record },
      },
      componentTemplate
    );

    dialog.afterClosed().subscribe(res => {
      let licenseName;
      const documentSelected = this.formInfo.controls.license.value;
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
    if (item.contractProfileId) {
      const dialogData = new ConfirmDialogModel(
        this.translateService.instant('common.confirm.title.delete'),
        this.translateService.instant('common.confirm.delete'),
        this.translateService.instant('common.button.delete')
      );
      const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
        maxWidth: '400px',
        data: dialogData,
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // nếu có trong db thì xóa gọi api
          this._contractService
            .deleteProfiles(this.node.custId, this.node.contractId, item.contractProfileId)
            .subscribe(rs => {
              if (rs.mess.code === HTTP_CODE.SUCCESS) {
                this._toastrService.success(
                  this.translateService.instant('common.notify.save.success')
                );
                this.processSearchContractProfile();
              } else {
                this._toastrService.error(this._translateService.instant(rs.mess.description));
              }
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
    this._contractService.downloadProfileByContract(item.contractProfileId).subscribe(
      data => {
        saveAs(data, item.fileName);
      },
      () => {
        this._toastrService.warning(this._translateService.instant('common.notify.fail'));
      }
    );
  }

  onUpdateContractFile() {
    const contractProfiles = {
      actTypeId: ACTION_TYPE.THAY_DOI_HD,
      contractProfiles: this.dataModel.dataSource.filter(x => !x.contractProfileId),
    };
    this._contractService
      .updateProfiles(contractProfiles, this.node.custId, this.node.contractId)
      .subscribe(
        rs => {
          if (rs.mess.code === HTTP_CODE.SUCCESS) {
            this._toastrService.success(
              this._translateService.instant('common.notify.save.success')
            );
            this.processSearchContractProfile();
          } else {
            this._toastrService.error(this._translateService.instant(rs.mess.description));
          }
        },
        error => {
          this._toastrService.warning(this._translateService.instant('common.notify.fail'));
        }
      );
  }
  trackByFn(index, item) {
    return index;
  }
}
