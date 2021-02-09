import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonUtils } from '@app/shared';
import { HelperService } from '@app/shared/services/helper.service';
import { environment } from '@env/environment';
import { BasicService } from '../../basic.service';

@Injectable({
  providedIn: 'root'
})
export class TopupEtcService extends BasicService {

  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }

  searchTopupEtc(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/topup-etcs`;
    return this.getRequest(url, { params: buildParams });
  }

  exportExcelTopupEtc(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const url = `${this.serviceUrl}/topup-etcs/exports`;
    return this.postRequestFile2(url, searchData);
  }
}
