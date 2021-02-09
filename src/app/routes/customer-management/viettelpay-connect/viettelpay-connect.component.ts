import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ContractService, RESOURCE } from '@app/core';
import { AttachFileModel } from '@app/core/models/common.model';
import { AppStorage } from '@app/core/services/AppStorage';
import { CommonCRMService, CONNECT_VTP, HTTP_CODE, IC_VTP, IMPORT_FILE, SharedDirectoryService, SOURCE_MONEYVTP } from '@app/shared';
import { BaseComponent } from '@app/shared/components/base-component/base-component.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { COMMOM_CONFIG } from '@env/environment';
import { MtxDialog } from '@ng-matero/extensions';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { ToastrService } from 'ngx-toastr';
import { Subscription, timer } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

class SearchModel {
  msisdn?: string;
  actTypeId?: number;
}

@Component({
  selector: 'app-viettelpay-connect',
  templateUrl: './viettelpay-connect.component.html',
  styleUrls: ['./viettelpay-connect.component.scss']
})
export class ViettelpayConnectComponent extends BaseComponent implements OnInit {
  formSave: FormGroup;
  titlePopup: string;
  show: any;
  listDocumentType = [];
  isLoadingAuto: boolean;
  selectedContract: any = {};
  states = [];
  listChooseFile: AttachFileModel[] = [] as AttachFileModel[];
  listChooseFileAccept: AttachFileModel[] = [] as AttachFileModel[];
  listFormatFile = ['.jpg', '.png', '.tiff', '.bmp', '.pdf'];
  importFile = IMPORT_FILE;
  sourceConnect: any = {};
  sourceMoneyConnect = ['Viettelpay', 'Mobile Money'];
  month: any = {};
  miniseconds: any = {};
  arrIc = ['IC', '', 'PP', 'CC'];
  idTypeValue: any = {};
  originalOrderId: any = {};
  baseCMT: any = {};
  baseAcceptAcc: any = {};
  methodRecharge = [];
  ewallet = [];
  fileCMTDrop: File = null;
  fileAccDrop: File = null;
  sub: Subscription;
  isConfirm = false;
  isShowInfor = false;
  countOtp = 0;
  constructor(
    public actr: ActivatedRoute,
    private _contractInfoService: ContractService,
    private fb: FormBuilder,
    protected toastr: ToastrService,
    public dialog?: MtxDialog,
    private _sharedDirectoryService?: SharedDirectoryService,
    private toars?: ToastrService,
    protected _translateService?: TranslateService,
    private _crmService?: CommonCRMService
  ) {
    super(actr, _crmService, RESOURCE.CUSTOMER);
  }
  public buttonName: any = 'Show';

  ngOnInit() {
    this.formSave = this.fb.group({
      contractNumber: [''],
      type_acc: ['', Validators.required],
      wallet_name: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.maxLength(11)]],
      number_acc: ['', Validators.maxLength(20)],
      holder_acc: ['', Validators.maxLength(255)],
      OTP: [''],
      type_papers: ['', Validators.required],
      number_papers: ['', [Validators.required, Validators.maxLength(20)]],
      default_moneySource: [''],
      CMT: ['', Validators.required],
      acceptAcc: ['', Validators.required],
    });
    this.customizeNumber();
    this.methodRecharge = AppStorage.get('method-recharges').listData;
    this.formSave.controls.number_acc.disable();
    this.formSave.controls.holder_acc.disable();
    this.formSave.controls.default_moneySource.disable();
    this.getListDocumentTypeByCustomer();
  }
  customizeNumber() {
    let randomNumber = (Math.floor(Math.random() * 999999) + 0).toString();
    const lenghtNumber = randomNumber.length;
    if (lenghtNumber < 6) {
      for (let i = 0; i < (6 - lenghtNumber); i++) {
        randomNumber = `0` + randomNumber;
      }
    }
    return randomNumber;
  }

  filter() {
    if (this.formSave.controls.contractNumber.value?.trim()) {
      this._contractInfoService.searchContractInfo(this.formSave.controls.contractNumber.value?.trim()).subscribe(rs => {
        if (rs.mess.code == HTTP_CODE.SUCCESS && rs.data.listData.length > 0) {
          this.selectedContract = rs.data.listData[0];
          this.selectedContract.signDate = this.selectedContract.signDate ? this.selectedContract.signDate.split(' ')[0] : null;
          this.selectedContract.effDate = this.selectedContract.effDate ? this.selectedContract.effDate.split(' ')[0] : null;
          this.selectedContract.expDate = this.selectedContract.expDate ? this.selectedContract.expDate.split(' ')[0] : null;
        }
      }, (err) => {
        this.toars.warning(this._translateService.instant(err.mess.description));
      });
    }
  }

  toggle() {
    this.show = !this.show;
    if (this.show) this.buttonName = 'Hide';
    else this.buttonName = 'Show';
  }

  /**
   * set mặc định là loại khách hàng cá nhân trong nước (linh tester)
   */
  getListDocumentTypeByCustomer() {
    this._crmService.getListDocumentTypeByCustomer(1).subscribe(res => {
      this.listDocumentType = res.data.filter(x => x.code == "CMND" || x.code == "HC" || x.code == "TCC");
    });
  }

  checkSourceMoneyVTP() {
    const param: SearchModel = {};
    if (this.formSave.controls.phoneNumber.value.trim()) {
      param.msisdn = this.formSave.controls.phoneNumber.value.trim();
    }
    param.actTypeId = CONNECT_VTP.ACTIONTYPE;

    this._crmService.checkSourceMoneyVTP(param).subscribe(res => {
      if (res.mess.code == HTTP_CODE.SUCCESS) {
        this.sourceConnect = res.data.moneySources[0].bankCode;
        if (this.sourceConnect == SOURCE_MONEYVTP.VIETTEL_PAY) {
          this.formSave.controls.default_moneySource.setValue(this.sourceMoneyConnect[0]);
        } else if (this.sourceConnect == SOURCE_MONEYVTP.MOBILE_MM) {
          this.formSave.controls.default_moneySource.setValue(this.sourceMoneyConnect[1]);
        }
        this.formSave.controls.holder_acc.setValue(res.data.moneySources[0].accName);
        this.formSave.controls.number_acc.setValue(res.data.moneySources[0].accNo);
      } else {
        this.toastr.error(this._translateService.instant('common.500Error'));
      }
    }, error => {
      this.toastr.error(error.mess.description);
    });
  }

  chooseFileChange(chooseFiles, type) {
    const listFile = chooseFiles.target.files;
    const lastIndexFile = listFile[0].name.lastIndexOf('.');
    if (lastIndexFile) {
      const extendFile = listFile[0].name.substring(lastIndexFile).toLowerCase();
      const checkExtendFile = this.listFormatFile.find(x => x == extendFile);
      if (checkExtendFile && listFile[0].size <= 5000000) {
        this.convertFile(listFile[0], type);
      } else if (listFile[0].size > 5000000) {
        if (type === IMPORT_FILE.CMT) {
          if (!this.formSave.controls.CMT.value) {
            this.formSave.controls.CMT.setErrors({ size: true });
          }
        } else {
          if (!this.formSave.controls.acceptAcc.value) {
            this.formSave.controls.acceptAcc.setErrors({ size: true });
          }
        }
      } else {
        if (type === IMPORT_FILE.CMT) {
          if (!this.formSave.controls.CMT.value) {
            this.formSave.controls.CMT.setErrors({ filename: true });
          }
        } else {
          if (!this.formSave.controls.acceptAcc.value) {
            this.formSave.controls.acceptAcc.setErrors({ filename: true });
          }
        }
      }
    }
  }
  convertFile(file, type) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const index = reader.result.toString().indexOf('base64,');
      const base64 = index > 0 ? reader.result.toString().substring(index + 7) : '';
      const fileSelected: AttachFileModel = {
        fileName: file.name,
        fileSize: file.size,
        fileBase64: base64,
        fullBase64: reader.result.toString()
      } as AttachFileModel;
      if (type == IMPORT_FILE.CMT) {
        this.formSave.controls.CMT.updateValueAndValidity();
        this.formSave.controls.CMT.setValue(fileSelected.fileName);
        this.baseCMT = fileSelected.fileBase64;
      } else if (type == IMPORT_FILE.ACCEPT_ACCOUNT) {
        this.formSave.controls.acceptAcc.updateValueAndValidity();
        this.formSave.controls.acceptAcc.setValue(fileSelected.fileName);
        this.baseAcceptAcc = fileSelected.fileBase64;
      }
    };
    reader.onerror = (error) => {
    };
  }

  getValueRecharge(value) {
    this._sharedDirectoryService.getCategories(value).subscribe(rs => {
      this.ewallet = rs.data.listData.filter(x => x.code == 'MB');
    });
  }

  connectViettelPay() {
    this.confirmDialogUpdate();
  }
  onSelectedDocument(value) {
    if (value == IC_VTP.CMND) {
      this.idTypeValue = this.arrIc[0];
    }
    if (value == IC_VTP.CMQD) {
      this.idTypeValue = this.arrIc[1];
    }
    if (value == IC_VTP.HC) {
      this.idTypeValue = this.arrIc[2];
    }
    if (value == IC_VTP.CCCD) {
      this.idTypeValue = this.arrIc[3];
    }
  }

  clearInputOtp(event) {
    this.formSave.controls.OTP.setValue(null);
  }

  confirmConnectVTP() {
    this.isConfirm = true;
    const bodyConfirm = {
      orderId: `${moment(new Date()).format(COMMOM_CONFIG.DATE_FORMAT_MILISECONDS)}` + `${this.customizeNumber()}`,
      contractId: this.selectedContract.contractId,
      msisdn: this.formSave.controls.phoneNumber.value.trim(),
      otp: this.formSave.controls.OTP.value,
      originalOrderId: this.originalOrderId,
      cardDocumentName: this.formSave.controls.CMT.value,
      cardFileBase64: this.baseCMT,
      documentLinkInitName: this.formSave.controls.acceptAcc.value,
      documentLinkInitFileBase64: this.baseAcceptAcc,
      idNo: this.formSave.controls.number_papers.value.trim(),
      idType: this.idTypeValue,
      actionTypeId: CONNECT_VTP.ACTIONTYPE,
      topupAuto: 0,
      topupAmount: null,
      accountNumber: this.formSave.controls.number_acc.value.trim(),
      accountOwner: this.formSave.controls.holder_acc.value.trim(),
      documentTypeId: this.listDocumentType.find(x => x.code == this.formSave.controls.type_papers.value)?.id,
      documentTypeCode: this.formSave.controls.type_papers.value,
      documentNo: this.formSave.controls.number_papers.value.trim(),
      bankCode: this.sourceConnect,
    };
    this._crmService.confirmConnectViettelpay(bodyConfirm).subscribe(resConfirm => {
      if (resConfirm.mess.code == HTTP_CODE.SUCCESS) {
        this.toastr.success(this._translateService.instant('common.notify.connect.success'));
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        this.toastr.error(this._translateService.instant('common.notify.connect.fail'));
      }
    }, error => {
      this.countOtp++;
      if (this.countOtp > 3) {
        this.formSave.controls.OTP.disable();
        this.toastr.error(this._translateService.instant('common.notify.connect.fail.three'));
        setTimeout(() => {
          window.location.reload();
        }, 4000);
      } else {
        this.formSave.controls.OTP.setValue(null);
        this.toastr.error(error.mess.description);
      }
    });
  }

  confirmDialogUpdate(): void {
    const message = this._translateService.instant('common.confirm.title.connect');
    const dialogData = new ConfirmDialogModel(this._translateService.instant('common.confirm.connect'),
      message);
    const dialogRef = this.dialog.originalOpen(ConfirmDialogComponent, {
      maxWidth: 'auto',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        const body = {
          orderId: `${moment(new Date()).format(COMMOM_CONFIG.DATE_FORMAT_MILISECONDS)}` + `${this.customizeNumber()}`,
          contractId: this.selectedContract.contractId,
          msisdn: this.formSave.controls.phoneNumber.value.trim(),
          contractNo: this.selectedContract.contractNo,
          contractFullName: this.selectedContract.custName,
          bankCode: this.sourceConnect,
          topupAuto: null,
          topupAmount: null,
          documentTypeId: this.listDocumentType.find(x => x.code == this.formSave.controls.type_papers.value)?.id,
          documentTypeCode: this.formSave.controls.type_papers.value,
          documentNo: this.formSave.controls.number_papers.value.trim(),
          idNo: this.formSave.controls.number_papers.value.trim(),
          idType: this.idTypeValue,
          actionTypeId: CONNECT_VTP.ACTIONTYPE
        };
        this._crmService
          .connectViettelpay(body)
          .subscribe(res => {
            if (res.mess.code == HTTP_CODE.SUCCESS) {
              this.originalOrderId = res.data.orderId;
              this.toastr.success(this._translateService.instant('common.notify.connect.success.otp'));
              this.toggle();
              this.isShowInfor = true;
            } else {
              this.toastr.error(res.mess.description);
            }
          }, error => {
            this.toastr.error(error.mess.description);
          });

        const timer$ = timer(300000).pipe(
          takeWhile(x => this.isConfirm != true)
        ).subscribe(r => {
          window.location.reload();
        });
      }
    });
  }

  dropped(files: NgxFileDropEntry[], type) {
    if (type == IMPORT_FILE.CMT) {
      this.formSave.controls.CMT.markAsTouched();
      const droppedFile = files[0];
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          this.fileCMTDrop = file;
          if (this.fileCMTDrop) {
            // this.formSave.get('CMT').patchValue(this.fileCMTDrop.name);
            const lastIndexFile = this.fileCMTDrop.name.lastIndexOf('.');
            if (lastIndexFile) {
              const extendFile = this.fileCMTDrop.name.substring(lastIndexFile).toLowerCase();
              if (extendFile) {
                const checkExtendFile = this.listFormatFile.find(x => x == extendFile);
                if (checkExtendFile && this.fileCMTDrop.size <= 5000000) {
                  this.convertFile(this.fileCMTDrop, type);
                } else if (this.fileCMTDrop.size > 5000000) {
                  if (!this.formSave.controls.CMT.value) {
                    this.formSave.controls.CMT.setErrors({ size: true });
                  }
                } else {
                  if (!this.formSave.controls.CMT.value) {
                    this.formSave.controls.CMT.setErrors({ filename: true });
                  }
                }
              }
            }
          }
        });
      }
    } else {
      this.formSave.controls.acceptAcc.markAsTouched();
      const droppedFile = files[0];
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          this.fileAccDrop = file;
          if (this.fileAccDrop) {
            // this.formSave.get('acceptAcc').patchValue(this.fileAccDrop.name);
            const lastIndexFile = this.fileAccDrop.name.lastIndexOf('.');
            if (lastIndexFile) {
              const extendFile = this.fileAccDrop.name.substring(lastIndexFile).toLowerCase();
              if (lastIndexFile) {
                const checkExtendFile = this.listFormatFile.find(x => x == extendFile);
                if (checkExtendFile && this.fileAccDrop.size <= 5000000) {
                  this.convertFile(this.fileAccDrop, type);
                } else if (this.fileCMTDrop.size > 5000000) {
                  if (!this.formSave.controls.acceptAcc.value) {
                    this.formSave.controls.acceptAcc.setErrors({ size: true });
                  }
                } else {
                  if (!this.formSave.controls.acceptAcc.value) {
                    this.formSave.controls.acceptAcc.setErrors({ filename: true });
                  }
                }
              }
            }
          }
        });
      }
    }
  }
}
