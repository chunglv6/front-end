import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BriefCaseService, ContractService, RESOURCE } from '@app/core';
import { CommonCRMService } from '@app/shared';
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

@Component({
  selector: 'table-contract-additional',
  templateUrl: './table-contract-additional.component.html',
  styleUrls: ['./table-contract-additional.component.css'],
})
export class TableContractAdditionalComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() contractId: number;
  @Input() customerId: number;
  listOptionLicense = [];
  @ViewChild('crmtable') crmTable: CrmTableComponent;
  @Input() dataChanges: any;
  selectLicence: number;
  @Input() isInvalid: boolean;
  @Input() actTypeId: number;
  constructor(
    protected _translateService: TranslateService,
    public actr: ActivatedRoute,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
    public _contractService?: ContractService,
    public _briefCaseService?: BriefCaseService,
    private _toastrService?: ToastrService,
    private _commonCRMService?: CommonCRMService
  ) {
    super(actr, _contractService, RESOURCE.PROFILE, toastr, _translateService, dialog);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes?.contractId?.currentValue !== changes?.contractId?.previousValue &&
      changes?.contractId.previousValue &&
      changes?.contractId?.currentValue
    ) {
      this.getData();
      this.getListDocumentType();
    }
    if (changes?.contractId?.firstChange) {
      this.getData();
      this.getListDocumentType();
    }
  }
  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'customer-management.updateProfileTable.documentType', field: 'documentTypeName' },
      { i18n: 'customer-management.updateProfileTable.documentName', field: 'fileName' },
      { i18n: 'common.action', field: 'option' },
    ];
    super.mapColumn();
  }
  getData() {
    this.isLoading = true;
    this.searchModel.actTypeId = ACTION_TYPE.BO_SUNG_HD;
    delete this.searchModel.pagesize;
    this._contractService
      .searchContractProfiles(this.searchModel, this.contractId)
      .subscribe(res => {
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
        }
      );
  }
  getListDocumentType() {
    this._commonCRMService.getListDocumentTypeObject(this.actTypeId).subscribe(res => {
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
    });
  }

  removeSelectedFile(item, i) {
    if (item.contractProfileId) {
      const dialogData = new ConfirmDialogModel(
        this._translateService.instant('common.confirm.title.delete'),
        this._translateService.instant('common.confirm.delete'),
        this._translateService.instant('common.button.delete')
      );
      const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
        maxWidth: '400px',
        data: dialogData,
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // nếu có trong db thì xóa gọi api
          this._contractService
            .deleteProfiles(this.customerId, this.contractId, item.contractProfileId)
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
              }
            );
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
      err => {
        this._toastrService.warning(this._translateService.instant('common.notify.fail'));
      }
    );
  }
  onUpdateContractFile() {
    const body = {
      birthDate: moment(this.dataChanges.signBirthDate).format(COMMOM_CONFIG.DATE_TIME_FORMAT),
      custId: this.customerId,
      custName: this.dataChanges.signName,
      dateOfIssue: moment(this.dataChanges.signDateIssue).format(COMMOM_CONFIG.DATE_TIME_FORMAT),
      gender: this.dataChanges.signGender,
      placeOfIssue: this.dataChanges.signPlaceIssue,
      contractProfiles: this.dataModel.dataSource.filter(f => !f.contractProfileId),
      actTypeId: ACTION_TYPE.BO_SUNG_HD,
    };
    this._briefCaseService.additionalBriefcases(this.contractId, body).subscribe(
      rs => {
        if (rs.mess.code === HTTP_CODE.SUCCESS) {
          this._toastrService.success(this._translateService.instant('common.notify.save.success'));
        } else {
          if (rs.mess.code === HTTP_CODE.STATUS_ERROR) {
            this._toastrService.warning(this._translateService.instant('briefcase.status_error'));
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
}
