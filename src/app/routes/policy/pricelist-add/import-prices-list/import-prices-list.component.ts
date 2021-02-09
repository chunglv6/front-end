import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { TicketPricesService } from '@app/core/services/policy/ticket-prices.service';

@Component({
  selector: 'app-import-prices-list',
  templateUrl: './import-prices-list.component.html',
  styleUrls: ['./import-prices-list.component.css']
})
export class ImportPricesListComponent implements OnInit {

  formImport: FormGroup;
  fileList: File = null;

  constructor(private _fb: FormBuilder,
    protected toastr: ToastrService,
    protected translateService: TranslateService,
    private _ticketPricesService: TicketPricesService) { }

  ngOnInit() {
    this.formImport = this._fb.group({
      inputFile: ['']
    });
  }

  onDownloadFile(event) {
    this._ticketPricesService.downloadTemplateTicketPrice().subscribe(res => {
      saveAs(res, 'template.xlsx');
    });
    event.stopPropagation();
  }

  onFileChange(files: FileList) {
    this.fileList = files[0];
    this.formImport.get('inputFile').patchValue(this.fileList.name)
  }

  saveImportFile(data) {
    this._ticketPricesService.importFilePriceList(data).subscribe(res => {
      const contentDisposition = res.headers.get('content-disposition');
      if (contentDisposition) {
        const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
        this.toastr.success(this.translateService.instant('pricelist.import-success'));
        saveAs(res.body, filename);
      } else {
        this.toastr.warning(this.translateService.instant('common.file-invalid-format'));
      }
    },
      err => {
        if (err.type === 'application/octet-stream') {
          saveAs(err, 'import_fail.xlsx');
          this.toastr.warning(this.translateService.instant('common.notify.err.excel.sevice_plan'));
        } else if (err.type === 'error' || err.type === 'application/json') {
          this.toastr.warning(this.translateService.instant('common.notify.err.excel.sevice_plan.template.fail'));
        } else {
          this.toastr.warning(this.translateService.instant('common.notify.fail'));
        }
      })
  }

  onSaveFile() {
    const formData: FormData = new FormData();
    formData.append('fileImport', this.fileList);
    this.saveImportFile(formData);
  }

}
