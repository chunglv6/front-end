import { Injectable } from '@angular/core';
import { BasicService } from '../basic.service';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '@app/shared/services/helper.service';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { CommonUtils } from '@app/shared/services/common-utils.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService extends BasicService {

  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(environment.serverUrl.api, environment.API_PATH.BASE_API_PATH, httpClient, helperService);
  }

  registerCustomerEnterprise(body: any) {
    const url = `${this.serviceUrl}/customer-enterprise`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  registerCustomerPersonal(body: any) {
    const url = `${this.serviceUrl}/customer-personal`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  getDetailCustomer(customerId: number) {
    const url = `${this.serviceUrl}/customers/${customerId}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  searchCustomerInfo(inputSearch?: any) {
    const url = `${this.serviceUrl}/customer-info?inputSearch=${inputSearch}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  searchAllCustomers(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/customers`;
    return this.getRequest(url, { params: buildParams });
  }

  searchCustomerByPlateNumber(value: any) {
    const data = {
      plateNumber: value
    };
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/customers`;
    return this.getRequest(url, { params: buildParams });
  }

  searchActionCustomerHistories(data?: any, customerId?: number) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/customers/${customerId}/act-customers-histories`;
    return this.getRequest(url, { params: buildParams });
  }

  updateCustomerPersonal(customerId, body) {
    const url = `${this.serviceUrl}/customer-personal/${customerId}`;
    return this.putRequest(url, body);
  }

  updateCustomerEnterprise(customerId, body) {
    const url = `${this.serviceUrl}/customer-enterprise/${customerId}`;
    return this.putRequest(url, body);
  }

  saveFileImport(formData: any, customerId: number, contractId: number) {
    const url = `${this.serviceUrl}/customers/${customerId}/contracts/${contractId}/import-vehicles`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, formData);
  }

  getCustomerByNumberPhone(data: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/customers/registry-info`;
    return this.getRequest(url, { params: buildParams });
  }
  getOrderCustomerRegister(orderNumber) {
    const url = `${this.serviceUrl}/order-number/${orderNumber}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }
  changePass(body: any) {
    const url = `${this.serviceUrl}/mobile/change/user`;
    this.helperService.isProcessing(true);
    return this.putRequest(url, body);
  }

  searchCustRegis(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/cust-registers`;
    return this.getRequest(url, { params: buildParams });
  }

  exportExcelCustRegis(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const url = `${this.serviceUrl}/cust-registers/exports`;
    return this.postRequestFile2(url, searchData);
  }
}
