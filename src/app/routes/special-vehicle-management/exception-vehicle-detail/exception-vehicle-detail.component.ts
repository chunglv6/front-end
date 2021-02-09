import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SelectOptionModel } from '@app/core/models/common.model';
import { AppStorage } from '@app/core/services/AppStorage';
import { VehicleService } from '@app/core/services/vehicle/vehicle.service';
import { SPECIAL_PRIORITY } from '@app/shared';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-exception-vehicle-detail',
  templateUrl: './exception-vehicle-detail.component.html',
  styleUrls: ['./exception-vehicle-detail.component.scss']
})
export class ExceptionVehicleDetailComponent implements OnInit {

  formDetail: FormGroup;
  listAttachFile = [];
  listOptionExceptionType: SelectOptionModel[] = [] as SelectOptionModel[];
  listOptionTicketType: SelectOptionModel[] = [] as SelectOptionModel[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private _vehicleService: VehicleService,
    private _translateService: TranslateService
  ) { }

  ngOnInit() {
    this.buildForm();
    this.getDetailVehicleException();
    if (AppStorage.get('ticket-price-type')) {
      this.listOptionTicketType = AppStorage.get('ticket-price-type');
    }
  }

  buildForm() {
    this.formDetail = this.fb.group({
      exceptionType: '', // Loại ngoại lệ
      ticketType: '', // Loại giá vé
      plateNumber: '',
      plateType: '',
      groupVehicle: '', // Loại phương tiện thu phí
      seriNumber: '',
      vehicleOwner: '', // Chủ phương tiện
      contractNo: '', // Số hợp đồng
      stationOrStage: '', // Đoạn/ Trạm
      effectiveDateFrom: null, // Ngày hiệu lực: Từ ngày - đến ngày
      effectiveDateTo: null,
      comment: '', // Ghi chú,
      documentName: '', // tên văn bản
      attachFile: '' // File đính kèm
    });
  }

  getDetailVehicleException() {
    this._vehicleService.getDetailVehicleException(this.data.data.exceptionListId).subscribe(rs => {
      this.patchValueForm(rs.data);
    })
  }

  patchValueForm(formValue) {
    const findTicketType = this.listOptionTicketType.find(x => x.code == formValue?.exceptionTicketType);
    let ticketTypeName = '';
    if (findTicketType) {
      ticketTypeName = findTicketType.value;
    }
    this.formDetail.patchValue({
      exceptionType: this.data.data.exceptionType == SPECIAL_PRIORITY.VEHICLE ? this._translateService.instant('special-vehicle.vehicle.type') : this.data.data.exceptionType == SPECIAL_PRIORITY.TICKET ? this._translateService.instant('special-vehicle.ticket.type') : '',
      groupVehicle: this.data.data.groupVehicle,
      ticketType: ticketTypeName,
      plateNumber: formValue.plateNumber,
      plateType: this.data.data.plateType,
      seriNumber: this.data.data.rfidSerial,
      vehicleOwner: formValue.customerName,
      contractNo: formValue.contractNo,
      stationOrStage: this.data.data.stationOrStage,
      effectiveDateFrom: formValue.effDate ? formValue.effDate.split(' ')[0] : '',
      effectiveDateTo: formValue.expDate ? formValue.expDate.split(' ')[0] : '',
      comment: formValue.description ?? null,
      documentName: formValue.attachmentFiles.length > 0 ? formValue.attachmentFiles[0].documentName : ''
    });
    this.accessAttachFile(formValue.attachmentFiles)
  }

  accessAttachFile(files: any[]) {
    files.forEach(f => {
      const findIndex = f.documentPath.lastIndexOf('/');
      if (findIndex > 0) {
        const fileName = f.documentPath.substring(findIndex + 38);
        const attachmentFileId = f.attachmentFileId;
        const fileDetail = {
          fileName: fileName,
          attachmentFileId: attachmentFileId
        }
        this.listAttachFile.push(fileDetail);
      }
    })
  }

  onDownloadFile(file) {
    this._vehicleService.downloadDocumentFile(file.attachmentFileId).subscribe(res => {
      saveAs(res, file.fileName);
    })
  }

}
