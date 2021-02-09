import { Injectable } from '@angular/core';
import { BasicService } from '../../core/services/basic.service';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '@app/shared/services/helper.service';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { CommonUtils } from './common-utils.service';
import { ACTION_TYPE } from '../constant/common.constant';

@Injectable({
  providedIn: 'root',
})
export class CommonCRMService extends BasicService {
  constructor(public httpClient: HttpClient, public helperService: HelperService) {
    super(
      environment.serverUrl.api,
      environment.API_PATH.BASE_API_PATH,
      httpClient,
      helperService
    );
  }

  // Danh sách loại khách hàng
  getListCustomerType() {
    const url = `${this.serviceUrl}/customer-types`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  // Danh sách loại giấy tờ
  getListDocumentType() {
    const url = `${this.serviceUrl}/document-types`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  getListDocumentTypeAll() {
    const url = `${this.serviceUrl}/mobile/document-types`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  // Lấy theo loại tác động
  getListDocumentTypeObject(actObjTypeId) {
    const url = `${this.serviceUrl}/document-types?id=${actObjTypeId}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  // Danh sách loại giấy tờ theo loại khách hàng
  getListDocumentTypeByCustomer(customerId) {
    const url = `${this.serviceUrl}/document-types/${customerId}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  getReason(actTypeId) {
    const url = `${this.serviceUrl}/action-reasons/${actTypeId}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  // customer đã bỏ tuy nhiên đã dùng nhiều nên để optional
  getFees(actionTypeId: number) {
    const url = `${this.serviceUrl}/fees?actionTypeId=${actionTypeId}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  getFeesReason(actReasonId: number) {
    const url = `${this.serviceUrl}/service-charges/act-reasons/${actReasonId}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  getActionType(objectId?: any) {
    let params = '';
    if (objectId) {
      params = `?actObject=${objectId}`;
    }
    const url = `${this.serviceUrl}/action-types` + params;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  getServicesFees() {
    const url = `${this.serviceUrl}/services-fees`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  downloadTemplateVehilce() {
    const url = `${this.serviceUrl}/vehicles/download-template`;
    return this.postRequestFile2(url);
  }

  importFileVehicle(customerId, contractId, data) {
    const url = `${this.serviceUrl}/customers/${customerId}/contracts/${contractId}/import-vehicles`;
    return this.postRequestFile2(url, data);
  }
  //Thien lay danh sách loại vé

  getTicketPriceTypes() {
    const url = `${this.serviceUrl}/ticket-prices/type`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  resetPassword(userId: string, newPassword?: string) {
    const body = {
      value: newPassword
    };
    const url = `${this.serviceUrl}/reset/users/${userId}`;
    return this.putRequest(url, body);
  }

  lockOrUnLockUser(userId: string, isLock: boolean) {
    const body = {
      enabled: isLock,
      actReasonId: 9,
      actTypeId: ACTION_TYPE.KHOA_TK_KH
    };
    const url = `${this.serviceUrl}/lock/users/${userId}`;
    return this.putRequest(url, body);
  }

  checkSourceMoneyVTP(data?: any) {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    const url = `${this.serviceUrl}/viettelpay/source/query`;
    return this.getRequest(url, { params: buildParams });
  }

  connectViettelpay(body: any) {
    const url = `${this.serviceUrl}/viettelpay/link-init`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  confirmConnectViettelpay(body: any) {
    const url = `${this.serviceUrl}/viettelpay/link-confirm`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  connectExistsViettelPay(contractId) {
    const url = `${this.serviceUrl}/contract-payments/${contractId}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  disconnectViettelpay(body: any) {
    const url = `${this.serviceUrl}/viettelpay/cancel-init`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  confirmDisconnectViettelpay(body: any) {
    const url = `${this.serviceUrl}/viettelpay/cancel-confirm`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  getListCashHistory(contractId) {
    const url = `${this.serviceUrl}/topup-etc/cash-histories?contractId=${contractId}`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }

  topUpETC(body: any) {
    const url = `${this.serviceUrl}/topup-etc/cashs`;
    this.helperService.isProcessing(true);
    return this.postRequest(url, body);
  }

  getSprintContract(body: any) {
    const url = `${this.serviceUrl}/topup-etc/cash/export`;
    this.helperService.isProcessing(true);
    return this.postRequestFile2(url, body);
  }

  getCountDashboard() {
    const url = `${this.serviceUrl}/count-dashboard`;
    this.helperService.isProcessing(true);
    return this.getRequest(url);
  }
}
