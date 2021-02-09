import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RESOURCE } from '@app/core';
import { TopupMoneyService } from '@app/core/services/topup-money/topup-money.service';
import { HTTP_CODE } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { COMMOM_CONFIG } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { iif, Subject } from 'rxjs';
import { debounceTime, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-topup-topupmoney',
  templateUrl: './topup.component.html',
  styleUrls: ['./topup.component.scss'],
})
export class TopupComponent extends BaseComponent implements OnInit, OnDestroy {
  isLoadingAccount = false;
  listAccount = [];
  tableForm: FormGroup;
  rowsForm: FormArray = this.fb.array([]);
  destroy$ = new Subject();
  dateNow;
  constructor(
    private fb: FormBuilder,
    private _topupMoneyService: TopupMoneyService,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    private matDialog: MatDialog,
  ) {
    super(null, null, RESOURCE.TOPUP)
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ngOnInit() {

    this.formSearch = this.fb.group({
      account: [''],
      topupDate: ['', [Validators.required, Validators.min(1)]],
      startrecord: [0],
      pagesize: [this.pageSizeList[0]]
    });
    this.columns = [
      { i18n: 'common.orderNumber', field: 'orderNumber' },
      { i18n: 'topup-money.leader-name', field: 'accountFullname' },
      { i18n: 'topup-money.leader-account', field: 'accountUser' },
      { i18n: 'topup-money.limit', field: 'amount' },
      { i18n: 'topup-money.balance-remain', field: 'balance' },
      { i18n: 'topup-money.amount-per-day', field: 'topupAmount' },
      { i18n: 'topup-money.time', field: 'topupDate' },
      { i18n: 'common.action', field: 'action' }
    ];
    super.mapColumn();
    this.tableForm = this.fb.group({ 'tableRowForm': this.rowsForm });
    // autocomplete
    this.f.account.valueChanges
      .pipe(
        debounceTime(1000),
        tap((v) => {
          this.isLoadingAccount = v != null;
          this.listAccount = [];
        }),
        switchMap(value =>
          iif(() => (typeof value !== 'object' && value && value?.trim().length > 0), this._topupMoneyService.getUserTopups(value, '', 0, 10)
            .pipe(finalize(() => (this.isLoadingAccount = false))), null)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(rs => {
        this.listAccount = rs.data.listData;
      });
  }

  get f() {
    return this.formSearch.controls
  }
  displayFn(acc: any) {
    if (acc) {
      return acc.accountFullname;
    }
  }
  getData() {
    if (this.formSearch.valid) {
      this.dateNow = moment(this.f.topupDate.value).isSame(moment().startOf('day').toDate());
      this.selectedRow = [];
      let stringDate = moment(this.f.topupDate.value).format(COMMOM_CONFIG.DATE_FORMAT);
      this._topupMoneyService.getUserTopups(this.f.account.value?.accountUser || '', stringDate, this.formSearch.value.startrecord, this.formSearch.value.pagesize).subscribe(rs => {
        if (rs.mess.code == HTTP_CODE.SUCCESS) {
          this.isLoading = true;
          this.dataModel.dataSource = rs.data.listData;
          this.totalRecord = rs.data.count;
          // build formgroup trong table
          this.rowsForm.clear();
          this.dataModel.dataSource.forEach(element => {
            const rowForm = this.fb.group({
              'topupAmount': [element.topupAmount, [Validators.required, Validators.min(1), Validators.max(element.amount - element.balance)]],
              'accountUser': [element.accountUser],
              'checked': [false],
            });
            this.rowsForm.push(rowForm);
          });
          this.isLoading = false;
        }
      })

    }
  }
  onSearch() {
    this.pageIndex = 0;
    this.formSearch.controls.startrecord.setValue(0);
    this.getData();
  }
  onPageChange(event) {
    this.pageIndex = event.pageIndex;
    this.formSearch.controls.startrecord.setValue(
      event.pageIndex === 0 ? event.pageIndex : event.pageIndex * event.pageSize
    );
    this.formSearch.controls.pagesize.setValue(event.pageSize);
    this.getData();
  }
  showPopUpConfirm() {
    const dialogData = new ConfirmDialogModel(
      this._translateService.instant('topup-money.popup-title-transfer'),
      this._translateService.instant('topup-money.popup-message-transfer'),
      this._translateService.instant('topup-money.transfer')
    );
    let dialogRef = this.matDialog.open(ConfirmDialogComponent, {
      width: '20%',
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(rs => {
      if (rs) {
        this.transfer();
      }
    })
  }
  transfer() {
    let body = this.rowsForm.value.filter(x => x.checked);
    let o = '';
    let m = '';
    this._topupMoneyService.topUpMoney({ users: body }).subscribe(rs => {
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        if (rs.data.error?.length > 0) {
          rs.data.error.forEach(element => {
            m = m + `${element.accountUser}: ${element.mess} ${'\n'}`;
          });
          this._toastrService.warning(m, null, {
            messageClass: 'pre-wrap'
          });
          if (rs.data.sucess?.length > 0) {
            rs.data.success?.forEach(element => {
              o = o + `${element.accountUser}: ${element.mess} ${'\n'}`;
            });
            this._toastrService.success(o, null, {
              messageClass: 'pre-wrap'
            });
          }
        } else {
          this._toastrService.success(this._translateService.instant('topup-money.notify-transfer-success'))
        }
        this.getData();
      } else {
        this._toastrService.warning(this._translateService.instant(rs.mess.description))
      }
    }, err => {
      this._toastrService.warning(this._translateService.instant('common.500Error'));
    })
  }
  checkChange(i, row) {
    row.checked = !row.checked;
    if (row.checked) {
      this.selectedRow.push(row);
    } else {
      this.selectedRow.splice(this.selectedRow.indexOf(row), 1);
    }
  }
}
