import { Injectable } from '@angular/core';
import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '@app/shared/services/helper.service';
import { environment } from '@env/environment';
import { CommonUtils } from '@app/shared/services/common-utils.service';

@Injectable({
  providedIn: 'root'
})
export class ManageFeeService extends BasicService {

  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }

  searchManageFee(data?: any,id?:any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/service-charges`;
    return this.getRequest(url, { params: buildParams });
  }

  deleteManageFee(id)
  {
    const url = `${this.serviceUrl}/service-charges/${id}`;
    return this.deleteRequest(url);
  }

  approveManageFee(data)
  {
    const url = `${this.serviceUrl}/service-charges/approves`;
    return this.putRequest(url,CommonUtils.convertData(data));
  }

  save(data?,id?)
  {
    let url = `${this.serviceUrl}/service-charges`;
    if(id){
      url = `${this.serviceUrl}/service-charges/${id}`;
      return this.putRequest(url,CommonUtils.convertData(data));
    }
    else
      return this.postRequest(url, CommonUtils.convertData(data));
  }

  // xuất excell
  exportExcel(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const url = `${this.serviceUrl}/service-charges/exports`;
    return this.postRequestFile2(url, searchData);
  }
}
