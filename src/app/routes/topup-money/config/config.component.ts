import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RESOURCE } from '@app/core';
import { TopupMoneyService } from '@app/core/services/topup-money/topup-money.service';
import { HTTP_CODE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmBoldFormDialogModel, ConfirmDialogBoldFormComponent } from '@app/shared/components/confirm-dialog-bold-form/confirm-dialog-bold-form.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { iif, Subject } from 'rxjs';
import { debounceTime, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DetailConfigTopupMoneyComponent } from './detail/detail.component';

@Component({
  selector: 'app-config-topup-money',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent extends BaseComponent implements OnInit, OnDestroy {
  isLoadingAccount = false;
  account = new FormControl();
  destroy$ = new Subject();
  listAccount = [];
  constructor(
    private _matDialog: MatDialog,
    private _topupMoneyService: TopupMoneyService,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
  ) {
    super(null, null, RESOURCE.TOPUP)
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ngOnInit() {

    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber', type: 'order' },
      { i18n: 'topup-money.leader-name', field: 'accountFullname' },
      { i18n: 'topup-money.leader-account', field: 'accountUser' },
      { i18n: 'topup-money.limit', field: 'amount', type: 'currency' },
      { i18n: 'common.action', field: 'actions', type: 'custom' }
    ];
    this.account
      .valueChanges.pipe(
        debounceTime(1000),
        tap((v) => {
          this.isLoadingAccount = v != null;
          this.listAccount = [];
        }),
        switchMap(value =>
          iif(() => (typeof value !== 'object'), this._topupMoneyService.getUserTopups(value, '', 0, 10)
            .pipe(finalize(() => (this.isLoadingAccount = false))), null)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(rs => {
        this.listAccount = rs.data.listData;
      });
    this.getData();
  }
  displayFn(acc: any) {
    if (acc) {
      return acc.accountUser;
    }
  }
  openPopup(item, isView) {
    const dialogRef = this._matDialog.open(DetailConfigTopupMoneyComponent, {
      data: {
        item, isView
      },
      width: '70%',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(rs => {
      if (rs) {
        this.getData();
      }
    })
  }
  getData() {
    this._topupMoneyService.getUserTopups(this.account.value?.accountUser || '', '', this.searchModel.startrecord, this.searchModel.pagesize).subscribe(rs => {
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        this.isLoading = true;
        this.dataModel.dataSource = rs.data.listData;
        this.totalRecord = rs.data.count;
        this.isLoading = false;
      }
    })
  }
  selectedMember(event) {
    this.getData();
  }
  clearAccount() {
    this.account.setValue(null);
    this.getData();
  }
  view(item) {
    this.openPopup(item, true);
  }
  edit(item) {
    this.openPopup(item, false);
  }
  delete(item) {
    const message = this._translateService.instant('topup-money.confirm-delete-config');
    const dialogData = new ConfirmBoldFormDialogModel(this._translateService.instant('common.button.delete'), message, item.accountFullname, '?');
    const dialogRef = this._matDialog.open(ConfirmDialogBoldFormComponent, {
      maxWidth: '25%',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this._topupMoneyService.deleteConfig(item.accountUser).subscribe(res => {
          if (res.mess.code == HTTP_CODE.SUCCESS) {
            this._toastrService.success(this._translateService.instant('topup-money.delete-config-success'));
            this.getData();
          }
          else
            this._toastrService.warning(this._translateService.instant('common.notify.fail'));
        }, error => {
          this._toastrService.warning(this._translateService.instant('common.500Error'));
        });
      }
    });
  }
}
