import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TopupMoneyService } from '@app/core/services/topup-money/topup-money.service';
import { HTTP_CODE } from '@app/shared';
import { ValidationService } from '@app/shared/common/validation.service';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { COMMOM_CONFIG } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { iif } from 'rxjs';
import { debounceTime, tap, switchMap, finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-detail-cofig-topup-money',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailConfigTopupMoneyComponent extends BaseComponent implements OnInit, AfterViewChecked {
  formDetail: FormGroup;
  listAccount = [];
  constructor(
    private fb: FormBuilder,
    private _translateService: TranslateService,
    private _toastrService: ToastrService,
    private _topupMoneyService: TopupMoneyService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _dialodRef: MatDialogRef<DetailConfigTopupMoneyComponent>,
    @Inject(MAT_DIALOG_DATA) public dataDialog?: any
  ) {
    super();
  }

  ngOnInit() {
    this.dataModel.titlePopup = this._translateService.instant('topup-money.title-popup-add');
    if (this.dataDialog.item) {
      this.dataModel.titlePopup = this._translateService.instant('topup-money.title-popup-update');
    }
    if (this.dataDialog.isView) {
      this.dataModel.titlePopup = this._translateService.instant('topup-money.popup-detail-config') + this.dataDialog.item.accountFullname;
    }
    this.buildForm();
    this.getDetail();
  }
  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }
  getInfoMember() {
    this._topupMoneyService.getMember(this.formDetail.value.accountUser).subscribe(rs => {
      if (rs.mess.code == HTTP_CODE.SUCCESS) {
        const name = `${rs.data.firstName || ''} ${rs.data.lastName || ''}`;
        this.formDetail.controls.accountFullname.setValue(name);
        this.formDetail.controls.accountUserId.setValue(rs.data.id);
      } else {
        this.formDetail.controls.accountFullname.setValue(null);
        this.formDetail.controls.accountUserId.setValue(null);
        this._toastrService.warning(this._translateService.instant(rs.mess.description));
      }
    }, error => {
      this.formDetail.controls.accountFullname.setValue(null);
      this.formDetail.controls.accountUserId.setValue(null);

    })
  }
  buildForm() {
    this.formDetail = this.fb.group({
      accountUser: ['', [Validators.required, ValidationService.cannotWhiteSpace, Validators.maxLength(100)]],
      accountFullname: ['', [Validators.maxLength(255)]],
      accountUserId: ['', [Validators.required]],
      partyCode: ['', [Validators.maxLength(50)]],
      partyName: ['', [Validators.maxLength(255)]],
      email: ['', [Validators.pattern(COMMOM_CONFIG.EMAIL_FORMAT), Validators.maxLength(255)]],
      phoneNumber: ['', [Validators.pattern(COMMOM_CONFIG.NUMBER_PHONE_FORMAT), Validators.maxLength(255)]],
      dentityNumber: ['', Validators.maxLength(20)],
      amount: ['', [Validators.required]],
    });
    this.formDetail.controls.accountUserId.disable();
  }
  getDetail() {
    if (this.dataDialog.item) {
      this._topupMoneyService.getDetailUser(this.dataDialog.item.accountUser).subscribe(rs => {
        if (rs.mess.code == HTTP_CODE.SUCCESS) {
          this.formDetail.patchValue({
            accountUser: rs.data.accountUser,
            accountFullname: rs.data.accountFullname,
            accountUserId: rs.data.accountUserId,
            partyCode: rs.data.partyCode,
            partyName: rs.data.partyName,
            email: rs.data.email,
            phoneNumber: rs.data.phoneNumber,
            dentityNumber: rs.data.dentityNumber,
            amount: rs.data.amount
          });
        }
      })
    } else {
      this.formDetail.reset();
      this.formDetail.markAsUntouched();
    }
  }

  save() {
    if (this.dataDialog.item) {
      this._topupMoneyService.updateConfig(this.formDetail.getRawValue()).subscribe(rs => {
        if (rs.mess.code == HTTP_CODE.SUCCESS) {
          this._dialodRef.close(true);
          this._toastrService.success(this._translateService.instant('topup-money.update-config-success'));
        } else {
          this._toastrService.warning(this._translateService.instant(rs.mess.description));
        }
      }, error => {
        this._toastrService.error(this._translateService.instant('common.500Error'));
      });
    } else {
      this._topupMoneyService.addConfig(this.formDetail.getRawValue()).subscribe(rs => {
        if (rs.mess.code == HTTP_CODE.SUCCESS) {
          this._dialodRef.close(true);
          this._toastrService.success(this._translateService.instant('topup-money.add-config-success'));
        } else {
          this._toastrService.warning(this._translateService.instant(rs.mess.description));
        }
      }, error => {
        this._toastrService.error(this._translateService.instant('common.500Error'));
      })
    }
  }
}
