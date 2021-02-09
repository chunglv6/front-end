import { Injectable } from '@angular/core';
import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '@app/shared/services/helper.service';
import { environment } from '@env/environment';
import { CommonUtils } from '@app/shared/services/common-utils.service';

@Injectable({
  providedIn: 'root'
})
export class PromotionService extends BasicService {

  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }

  searchPromotion(data?: any,id?:any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/promotions`;
    return this.getRequest(url, { params: buildParams });
  }

  save(data?,id?)
  {
    let url = `${this.serviceUrl}/promotions`;
    if(id){
      url = `${this.serviceUrl}/promotions/${id}`;
      return this.putRequest(url,data);
    }
    else
      return this.postRequest(url, data);
  }

  deleteFile(id)
  {
    const url = `${this.serviceUrl}/promotions/attachments/${id}`;
    return this.deleteRequest(url);
  }

  deletePromotion(id)
  {
    const url = `${this.serviceUrl}/promotions/${id}`;
    return this.deleteRequest(url);
  }

  deletePromotionAssign(id)
  {
    const url = `${this.serviceUrl}/promotions/assigns/${id}`;
    return this.deleteRequest(url);
  }

  approvePromotion(data)
  {
    const url = `${this.serviceUrl}/promotions/approves`;
    return this.putRequest(url,CommonUtils.convertData(data));
  }

  searchPromotionAssign(id?)
  {
    const url = `${this.serviceUrl}/promotions/assigns?promotionId=${id}`;
    return this.getRequest(url);
  }

  assignPromotionObject(data)
  {
    const url = `${this.serviceUrl}/promotions/assigns/`;
    return this.postRequest(url, CommonUtils.convertData(data));
  }

  downloadFile(id){
    const url = `${this.serviceUrl}/promotions/attachments/${id}`;
    return this.postRequestFile2(url);
  }

  // xuất excell
  exportExcel(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    // const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/promotions/exports`;
    return this.postRequestFile2(url, searchData);
  }
}
