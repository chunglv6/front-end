import { Injectable } from '@angular/core';
import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '@app/shared/services/helper.service';
import { environment } from '@env/environment';
import { CommonUtils } from '@app/shared/services/common-utils.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryManagementService extends BasicService {

  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }

  //Danh mục loại tác động
  searchActType(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/act-type`;
    return this.getRequest(url, { params: buildParams });
  }

  editActType(body: any, actTypeId: number) {
    const url = `${this.serviceUrl}/act-type/${actTypeId}`;
    this.helperService.isProcessing(true);
    return this.putRequest(url, body);
  }

  addActType(body: any) {
    const url = `${this.serviceUrl}/act-type`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  getDetailImpact(actTypeId: number) {
    const url = `${this.serviceUrl}/act-type/${actTypeId}`;
    return this.getRequest(url);
  }

  //Danh mục lý do tác động
  searchActReason(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/act-reason`;
    return this.getRequest(url, { params: buildParams });
  }

  addActReason(body: any) {
    const url = `${this.serviceUrl}/act-reason`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  editActReason(body: any, actReasonId: number) {
    const url = `${this.serviceUrl}/act-reason/${actReasonId}`;
    this.helperService.isProcessing(true);
    return this.putRequest(url, body);
  }

  getDetailImpactReason(actReasonId: number) {
    const url = `${this.serviceUrl}/act-reason/${actReasonId}`;
    return this.getRequest(url);
  }

  //Cấu hình chứng từ theo loại khách hàng
  searchActTypeMapping(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/act-type-mapping`;
    return this.getRequest(url, { params: buildParams });
  }

  addActTypeMapping(body: any) {
    const url = `${this.serviceUrl}/act-type-mapping`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  editActTypeMapping(body: any, id: number) {
    const url = `${this.serviceUrl}/act-type-mapping/${id}`;
    this.helperService.isProcessing(true);
    return this.putRequest(url, body);
  }

  deleteActTypeMapping(id: number) {
    const url = `${this.serviceUrl}/act-type-mapping/${id}`;
    return this.deleteRequest(url);
  }

  moveActTypeMapping(id: number) {
    const url = `${this.serviceUrl}/act-type-mapping/update-status/${id}`;
    return this.putRequest(url);
  }

  getDetailImpactCustomer(id: number) {
    const url = `${this.serviceUrl}/act-type-mapping/${id}`;
    return this.getRequest(url);
  }

  //Cấu hình chứng từ theo loại tác động
  searchCustTypeMapping(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/cust-type-mapping`;
    return this.getRequest(url, { params: buildParams });
  }

  addCustTypeMapping(body: any) {
    const url = `${this.serviceUrl}/cust-type-mapping`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  editCustTypeMapping(body: any, id: number) {
    const url = `${this.serviceUrl}/cust-type-mapping/${id}`;
    this.helperService.isProcessing(true);
    return this.putRequest(url, body);
  }

  deleteCustTypeMapping(id: number) {
    const url = `${this.serviceUrl}/cust-type-mapping/${id}`;
    return this.deleteRequest(url);
  }

  moveCustTypeMapping(id: number) {
    const url = `${this.serviceUrl}/cust-type-mapping/update-status/${id}`;
    return this.putRequest(url);
  }

  getDetailImpactLicense(id: number) {
    const url = `${this.serviceUrl}/cust-type-mapping/${id}`;
    return this.getRequest(url);
  }
}
