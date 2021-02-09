import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BriefCaseService, RESOURCE, VehicleService } from '@app/core';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ACTION_TYPE, TYPEFILES, HTTP_CODE } from '@app/shared/constant/common.constant';
import {
  ConfirmDialogComponent,
  ConfirmDialogModel,
} from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { BriefcaseDenialComponent } from '../briefcase-denial/briefcase-denial.component';

@Component({
  selector: 'app-table-licensePlates',
  templateUrl: './table-licensePlates.component.html',
  styleUrls: ['./table-licensePlates.component.css'],
})
export class TableLicensePlatesComponent extends BaseComponent implements OnInit {
  displayedColumns = [];
  @Input() vehicleId: number;
  typeFile = TYPEFILES;
  @Input() contractId: number;
  @Input() custId: number;
  constructor(
    protected _translateService: TranslateService,
    public actr: ActivatedRoute,
    protected toastr: ToastrService,
    protected _vehicleService?: VehicleService,
    public dialog?: MtxDialog,
    private _briefCaseService?: BriefCaseService
  ) {
    super(actr, _vehicleService, RESOURCE.CUSTOMER, toastr, _translateService, dialog);
  }

  ngOnInit() {
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'briefcase.namelicense', field: 'documentTypeName' },
      { i18n: 'briefcase.typelicense', field: 'type' },
      { i18n: 'briefcase.date_recie', field: 'createDate', type: 'datetime' },
      { i18n: 'briefcase.profileExisted', field: 'profileExisted', type: 'custom' },
      { i18n: 'briefcase.profileFake', field: 'profileFake', type: 'custom' },
      { i18n: 'briefcase.profileScan', field: 'profileScan', type: 'custom' },
      { i18n: 'briefcase.date_scan', field: 'scanDay', type: 'datetime' },
      { i18n: 'briefcase.note', field: 'description', type: 'custom' },
    ];
    this.getData();
  }
  getData() {
    this.isLoading = true;
    this._vehicleService
      .findProfileByVehicleAll(this.vehicleId, ACTION_TYPE.DANG_KY_PT)
      .subscribe(rs => {
        if (rs.mess.code === HTTP_CODE.SUCCESS) {
          this.dataModel.dataSource = rs.data.listData;
          this.totalRecord = rs.data.count;
          this.isLoading = false;
        } else {
          this.toastr.warning(rs.mess.description);
        }
      },
        error => {
          this.toastr.error(this._translateService.instant('common.notify.fail'));
        });
  }
  onDownLoadFile(item) {
    this._vehicleService.downloadProfileByVehicle(item.vehicleProfileId).subscribe(
      data => {
        saveAs(data, item.fileName);
      },
      err => {
        this.toastr.warning(this.translateService.instant('common.notify.fail'));
      }
    );
  }
  clickCheckbox(item) {
    if (!item.profileScan) {
      item.profileFake = null;
    }
  }
  approvalBriefcase() {
    const dialogData = new ConfirmDialogModel(
      this._translateService.instant('common.confirm.title.save'),
      this._translateService.instant('policy.question-accept')
    );
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: '40%',
      data: dialogData,
    });
    const body = {
      custId: this.custId,
      contractId: this.contractId,
      actTypeId: ACTION_TYPE.PHE_DUYET_HO_SO,
      accept: true,
      vehicleId: this.vehicleId,
      listDocument: this.dataModel.dataSource.map(x => {
        return {
          description: x.description ?? null,
          exist: x.profileExisted ?? null,
          fake: x.profileFake ?? null,
          documentTypeId: x.documentTypeId,
          listProfile: x.profileDTOList.map(p => {
            if (p.vehicleProfileId) {
              (p.profileId = p.contractProfileId), (p.fileName = p.fileName);
            }
            return p;
          }),
        };
      }),
    };
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this._briefCaseService.approvalVehicle(body).subscribe(
          rs => {
            if (rs.mess.code === HTTP_CODE.SUCCESS) {
              this.toastr.success(this._translateService.instant('common.notify.save.success'));
            } else {
              if (rs.mess.code === HTTP_CODE.STATUS_ERROR) {
                this.toastr.success(this._translateService.instant('briefcase.status_error'));
              } else {
                this.toastr.success(this._translateService.instant('common.notify.fail'));
              }
            }
          },
          error => {
            this.toastr.error(error.mess.description);
          }
        );
      }
    });
  }
  openDenial() {
    const dialog = this.dialog.open(
      {
        width: '70%',
      },
      BriefcaseDenialComponent
    );

    dialog.afterClosed().subscribe(res => {
      if (res) {
        const body = {
          accept: false,
          reason: res.reason,
          actTypeId: ACTION_TYPE.PHE_DUYET_HO_SO,
          custId: this.custId,
          contractId: this.contractId,
          vehicleId: this.vehicleId,
          listDocument: this.dataModel.dataSource.map(x => {
            return {
              description: x.description ?? null,
              exist: x.profileExisted ?? null,
              fake: x.profileFake ?? null,
              documentTypeId: x.documentTypeId,
              listProfile: x.profileDTOList.map(p => {
                if (p.vehicleProfileId) {
                  (p.profileId = p.vehicleProfileId), (p.fileName = p.fileName);
                }
                return p;
              }),
            };
          }),
        };
        this._briefCaseService.rejectVehicle(body).subscribe(
          rs => {
            if (rs.mess.code === HTTP_CODE.SUCCESS) {
              this.toastr.success('common.notify.save.success');
            }
            if (rs.mess.code === HTTP_CODE.STATUS_ERROR) {
              this.toastr.warning(this._translateService.instant('briefcase.status_error'));
            }
          },
          error => {
            this.toastr.error(error.mess.description);
          }
        );
      }
    });
  }
}
