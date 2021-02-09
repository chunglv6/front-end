import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BriefCaseService, ContractService, RESOURCE } from '@app/core';
import { CommonCRMService } from '@app/shared';
import { AttachFileComponent } from '@app/shared/components/attach-file/attach-file.component';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogModel,
} from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { ACTION_TYPE, TYPEFILES, HTTP_CODE } from '@app/shared/constant/common.constant';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { BriefcaseDenialComponent } from '../briefcase-denial/briefcase-denial.component';

@Component({
  selector: 'app-table-contract',
  templateUrl: './table-contract.component.html',
  styleUrls: ['./table-contract.component.css'],
})
export class TableContractComponent extends BaseComponent implements OnInit, OnChanges {
  displayedColumns = [];
  @Input() contractId: number;
  @Input() custId: number;
  @Input() contractNo: number;
  selectedDocument: number;
  listDataProfileRefresh = [];
  resultList = [];
  @ViewChild(AttachFileComponent) fileComponent: AttachFileComponent;
  @Input() actTypeId: number;
  typeFile = TYPEFILES;
  @Input() formApproveDetail;
  @Output() reloadData: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    protected _translateService: TranslateService,
    protected _toastrService: ToastrService,
    public actr: ActivatedRoute,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
    public _contractService?: ContractService,
    public _commonCRMService?: CommonCRMService,
    private _briefCaseService?: BriefCaseService
  ) {
    super(actr, _contractService, RESOURCE.CUSTOMER, toastr, _translateService, dialog);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes?.contractId?.currentValue !== changes?.contractId?.previousValue &&
      changes?.contractId.previousValue &&
      changes?.contractId?.currentValue
    ) {
      this.getData();
    }
    if (changes?.contractId?.firstChange) {
      this.getData();
    }
  }
  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'briefcase.namelicense', field: 'documentTypeName' },
      { i18n: 'briefcase.typelicense', field: 'type', type: 'custom', class: 'ui-text-left' },
      { i18n: 'briefcase.date_recie', field: 'createDate', type: 'datetime' },
      { i18n: 'briefcase.profileExisted', field: 'profileExisted', type: 'custom' },
      { i18n: 'briefcase.profileFake', field: 'profileFake', type: 'custom' },
      { i18n: 'briefcase.profileScan', field: 'profileScan', type: 'custom' },
      { i18n: 'briefcase.date_scan', field: 'scanDay', type: 'datetime' },
      { i18n: 'briefcase.note', field: 'description' },
    ];
    this.getData();
  }
  clickCheckbox(item) {
    if (!item.profileScan) {
      item.profileFake = null;
    }
  }
  getData() {
    this.isLoading = true;
    this._contractService.profilesAll(this.contractId, this.actTypeId).subscribe(res => {
      if (res.mess.code === HTTP_CODE.SUCCESS) {
        this.dataModel.dataSource = res.data.listData.map(x => {
          // tslint:disable-next-line: triple-equals
          x.profileExisted = x.status == 1;
          // tslint:disable-next-line: triple-equals
          x.profileFake = x.status == 3;
          return x;
        });
        this.totalRecord = res.data.count;
        this.isLoading = false;
      } else {
        this.toastr.error(this.translateService.instant('common.notify.fail'));
      }
    });
  }
  onDownLoadFile(item) {
    this._contractService.downloadProfileByContract(item.contractProfileId).subscribe(
      data => {
        saveAs(data, item.fileName);
      },
      () => {
        this.toastr.warning(this.translateService.instant('common.notify.fail'));
      }
    );
  }

  approvalBriefcase() {
    this.confirmDialog();
  }
  confirmDialog(): void {
    const dialogData = new ConfirmDialogModel(
      this._translateService.instant('briefcase.approve-document-popup-title') +
      ' ' +
      this.contractNo,
      this._translateService.instant('policy.question-accept'),
      this._translateService.instant('briefcase.approve'),
    );
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '40%',
      data: dialogData,
    });
    const body = {
      authDateOfIssue: moment(this.formApproveDetail.controls.signDateIssue.value).format(
        COMMOM_CONFIG.DATE_TIME_FORMAT
      ),
      signName: this.formApproveDetail.controls.signName.value,
      authPlaceOfIssue: this.formApproveDetail.controls.signPlaceIssue.value,
      birthDay: moment(this.formApproveDetail.controls.signBirthDate.value).format(
        COMMOM_CONFIG.DATE_TIME_FORMAT
      ),
      gender: this.formApproveDetail.controls.signGender.value,
      custId: this.custId,
      contractId: this.contractId,
      actTypeId: ACTION_TYPE.PHE_DUYET_HO_SO,
      accept: true,
      briefcasesDocumentsDTOList: this.dataModel.dataSource.map(x => {
        return {
          description: x.description ?? null,
          exist: x.profileExisted ?? null,
          fake: x.profileFake ?? null,
          id: x.documentTypeId,
          listProfile: x.profileDTOList.map(p => {
            if (p.contractProfileId) {
              p.profileId = p.contractProfileId;
            }
            return p;
          }),
        };
      }),
    };
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this._briefCaseService.approvalContract(body).subscribe(
          rs => {
            if (rs.mess.code === HTTP_CODE.SUCCESS) {
              this.toastr.success(this._translateService.instant('common.notify.save.success'));
              this.reloadData.next(true);
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
  openDenial() {
    this.showPopupDenial(null, BriefcaseDenialComponent);
  }

  showPopupDenial(record?, componentTemplate?) {
    const dialog = this.dialog.open(
      {
        width: '70%',
        data: record,
      },
      componentTemplate
    );

    dialog.afterClosed().subscribe(res => {
      if (res) {
        const body = {
          accept: false,
          reason: res.reason,
          actTypeId: ACTION_TYPE.PHE_DUYET_HO_SO,
          custId: this.custId,
          contractId: this.contractId,
          briefcasesDocumentsDTOList: this.dataModel.dataSource.map(x => {
            return {
              description: x.description ?? null,
              exist: x.profileExisted ?? null,
              fake: x.profileFake ?? null,
              id: x.documentTypeId,
              listProfile: x.profileDTOList.map(p => {
                if (p.contractProfileId) {
                  p.profileId = p.contractProfileId;
                }
                return p;
              }),
            };
          }),
        };
        this._briefCaseService.rejectContract(body).subscribe(
          rs => {
            if (rs.mess.code === HTTP_CODE.SUCCESS) {
              this.toastr.success(this._translateService.instant('common.notify.save.success'));
              this.reloadData.next(true);
            } else {
              if (rs.mess.code === HTTP_CODE.STATUS_ERROR) {
                this._toastrService.warning(
                  this._translateService.instant('briefcase.status_error')
                );
              } else {
                this.toastr.warning(this._translateService.instant('common.notify.fail'));
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
