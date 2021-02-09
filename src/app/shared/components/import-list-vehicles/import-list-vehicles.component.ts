import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonCRMService } from '@app/shared/services/common-crm.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { CreateVehicleSuccessModel } from '@app/core/models/common.model';
import { RouteStore } from '@app/routes/routes.store';
import { NgxFileDropEntry, FileSystemFileEntry } from 'ngx-file-drop';
import { saveAs } from 'file-saver';
import { RegisterServicesStore } from '@app/routes/register-services/register-services.store';

@Component({
  selector: 'app-import-list-vehicles',
  templateUrl: './import-list-vehicles.component.html',
  styleUrls: ['./import-list-vehicles.component.scss']
})
export class ImportListVehiclesComponent implements OnInit {

  formImport: FormGroup;
  fileVehicles: File = null;
  fileVehiclesDrop: File = null;
  disableSaveFile: boolean = true;

  constructor(private _fb: FormBuilder,
    private registerServicesStore: RegisterServicesStore,
    protected toastr: ToastrService,
    protected translateService: TranslateService,
    private _commonCRMService: CommonCRMService,
    private _routeStore: RouteStore,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _dialogRef: MatDialogRef<ImportListVehiclesComponent>
  ) { }

  ngOnInit() {
    this.formImport = this._fb.group({
      inputFile: [this.translateService.instant('customer-management.updateProfileForm.notSelectFile')]
    });
    this.dataChangeInputFile();
  }

  dataChangeInputFile() {
    this.formImport.get('inputFile').valueChanges.subscribe(val => {
      if (val == this.translateService.instant('customer-management.updateProfileForm.notSelectFile')) {
        this.disableSaveFile = true;
      } else {
        this.disableSaveFile = false;
      }
    })
  }

  onDownloadFile(event) {
    this._commonCRMService.downloadTemplateVehilce().subscribe(res => {
      const contentDisposition = res.headers.get('content-disposition');
      const fileName = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
      saveAs(res.body, fileName);
    });
    event.stopPropagation();
  }

  onFileChange(files: FileList) {
    this.fileVehicles = files[0];
    this.fileVehiclesDrop = null;
    this.formImport.get('inputFile').patchValue(this.fileVehicles.name)
  }

  dropped(files: NgxFileDropEntry[]) {
    const droppedFile = files[0];
    if (droppedFile.fileEntry.isFile) {
      const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
      fileEntry.file((file: File) => {
        this.fileVehiclesDrop = file
        this.fileVehicles = null;
        if (this.fileVehiclesDrop) {
          this.formImport.get('inputFile').patchValue(this.fileVehiclesDrop.name);
        }
      });
    }
  }
  saveImportFile(customerId, contractId, data) {
    this._commonCRMService.importFileVehicle(customerId, contractId, data).subscribe(res => {
      const contentDisposition = res.headers.get('content-disposition');
      const numberRecordError = Number(res.headers.get('Number-Records-Error'));
      if (contentDisposition) {
        const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
        if (numberRecordError > 0) {
          this.toastr.error(this.translateService.instant('common.import-file-error'));
        } else {
          this.toastr.success(this.translateService.instant('common.importSuccess'));
          this.registerServicesStore.changeNextToCustomerManage(true);
          const objTransfer: CreateVehicleSuccessModel = {
            customerId,
            contractId
          };
          this._routeStore.fireEventImportVehicle(objTransfer);
          this._routeStore.changeImportVehicleSuccess(true);
          this._dialogRef.close(true);
        }
        saveAs(res.body, filename);
      } else {
        this.toastr.warning(this.translateService.instant('common.file-invalid-format'));
      }
    },
      err => {
        this.toastr.error(this.translateService.instant('common.500Error'));
      })
  }

  onSaveFile() {
    const param = this.data.data.record;
    const formData: FormData = new FormData();
    if (this.fileVehicles) {
      formData.append('file', this.fileVehicles);
    } else {
      formData.append('file', this.fileVehiclesDrop);
    }
    this.saveImportFile(param.customerId, param.contractId, formData);
  }

}
